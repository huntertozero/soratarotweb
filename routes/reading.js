const express = require('express');
const cards = require('../data/cards');
const cardImages = require('../data/cardImages');
const { generateReading } = require('../services/claudeService');
const { sendSlackNotification } = require('../services/slackService');

const router = express.Router();

// ========== 24시간 사용 제한 헬퍼 ==========

const LIMIT_DURATION_MS = 24 * 60 * 60 * 1000;
const LIMIT_SPREADS = ['one', 'three', 'celtic'];
const SPREAD_NAMES = { one: '원 카드', three: '쓰리 카드', celtic: '켈틱 크로스' };
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getLimitCookieName(spread) {
  return `tarot_limit_${spread}`;
}

function getRemainingMs(cookieValue) {
  if (!cookieValue) return 0;
  const timestamp = parseInt(cookieValue, 10);
  if (isNaN(timestamp) || timestamp <= 0) return 0;
  const remaining = LIMIT_DURATION_MS - (Date.now() - timestamp);
  return remaining > 0 ? remaining : 0;
}

// 개발 우회 헤더 검증 (프로덕션에서는 항상 false)
function isDevBypass(req) {
  return !IS_PRODUCTION && req.headers['x-tarot-dev'] === '1';
}

// GET /api/limits - 스프레드별 잠금 상태 반환
router.get('/limits', (req, res) => {
  const result = {};
  LIMIT_SPREADS.forEach(spread => {
    if (isDevBypass(req)) {
      result[spread] = { locked: false, remainingMs: 0 };
      return;
    }
    const remaining = getRemainingMs(req.cookies[getLimitCookieName(spread)]);
    result[spread] = { locked: remaining > 0, remainingMs: remaining };
  });
  return res.status(200).json(result);
});

// DELETE /api/limits - 모든 제한 쿠키 초기화 (개발 전용)
router.delete('/limits', (req, res) => {
  if (IS_PRODUCTION) {
    return res.status(403).json({ error: '프로덕션 환경에서는 사용할 수 없습니다.' });
  }
  LIMIT_SPREADS.forEach(spread => res.clearCookie(getLimitCookieName(spread)));
  return res.status(200).json({ message: '모든 제한이 초기화되었습니다.' });
});

// POST /api/reading - 타로 해석 요청
router.post('/reading', async (req, res) => {
  try {
    const { spread, question, cards: requestCards } = req.body;

    // 1. spread 검증
    if (!spread || !['one', 'three', 'celtic'].includes(spread)) {
      return res.status(400).json({
        error: '잘못된 spread 타입입니다. "one", "three", "celtic" 중 하나여야 합니다.',
      });
    }

    // 1-b. 24시간 사용 제한 체크
    if (!isDevBypass(req)) {
      const remaining = getRemainingMs(req.cookies[getLimitCookieName(spread)]);
      if (remaining > 0) {
        return res.status(429).json({
          error: `${SPREAD_NAMES[spread]}는 24시간에 1회만 사용할 수 있습니다.`,
          remainingMs: remaining,
        });
      }
    }

    // 2. 카드 수 검증
    const expectedCardCounts = { one: 1, three: 3, celtic: 10 };
    const expectedCount = expectedCardCounts[spread];

    if (!Array.isArray(requestCards) || requestCards.length !== expectedCount) {
      return res.status(400).json({
        error: `${spread} 스프레드는 정확히 ${expectedCount}장의 카드가 필요합니다. (현재: ${requestCards?.length || 0}장)`,
      });
    }

    // 3. 카드 ID 범위 및 중복 검증
    const cardIds = new Set();
    const invalidIds = [];

    for (const card of requestCards) {
      if (typeof card.id !== 'number' || card.id < 0 || card.id > 77) {
        invalidIds.push(card.id);
      }
      if (cardIds.has(card.id)) {
        return res.status(400).json({
          error: `카드 ID ${card.id}가 중복되었습니다. 중복된 카드는 사용할 수 없습니다.`,
        });
      }
      cardIds.add(card.id);
    }

    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: `잘못된 카드 ID입니다: ${invalidIds.join(', ')} (범위: 0~77)`,
      });
    }

    // 4. 질문 길이 검증
    if (question && typeof question === 'string') {
      if (question.length > 200) {
        return res.status(400).json({
          error: '질문은 최대 200자입니다.',
        });
      }
    }

    // 5. 요청 카드의 상세 정보 조회
    const requestedCards = requestCards.map(rc => {
      const cardData = cards.find(c => c.id === rc.id);
      return {
        id: rc.id,
        isReversed: rc.isReversed || false,
        cardData, // Claude 호출용
      };
    });

    // 6. Claude로 해석 생성
    const startTime = Date.now();
    const { reading, usage } = await generateReading(
      spread,
      requestedCards.map(c => ({ id: c.id, isReversed: c.isReversed })),
      question || '',
      cards
    );
    const responseTime = Date.now() - startTime;

    // 7. 응답 생성 (카드 정보 + 해석)
    const responseCards = requestedCards.map(rc => ({
      id: rc.id,
      nameKo: rc.cardData.nameKo,
      isReversed: rc.isReversed,
      imageFile: cardImages[rc.id] || '',
      keywords: rc.isReversed
        ? rc.cardData.keywords.reversed
        : rc.cardData.keywords.upright,
      meaning: rc.isReversed
        ? rc.cardData.reversedMeaning
        : rc.cardData.uprightMeaning,
    }));

    // 리딩 성공 → 슬랙 알림 (비동기, 실패해도 응답에 영향 없음)
    sendSlackNotification({
      spread,
      question: question || '',
      cards: responseCards,
      usage,
      responseTime,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
      acceptLanguage: req.headers['accept-language'] || '',
      isDev: isDevBypass(req),
    });

    // 리딩 성공 → 24시간 제한 쿠키 설정
    if (!isDevBypass(req)) {
      res.cookie(getLimitCookieName(spread), Date.now().toString(), {
        maxAge: LIMIT_DURATION_MS,
        httpOnly: true,
        secure: IS_PRODUCTION,  // Railway(HTTPS)에서만 secure
        sameSite: 'Lax',
      });
    }

    return res.status(200).json({
      reading,
      cards: responseCards,
    });
  } catch (error) {
    console.error('❌ API 에러:', error.message);

    // Claude API 타임아웃 처리
    if (error.message.includes('타임아웃')) {
      return res.status(504).json({
        error: 'Claude API가 응답하지 않습니다. 다시 시도해주세요.',
      });
    }

    // 기타 에러
    return res.status(500).json({
      error: '타로 해석 중 오류가 발생했습니다. 다시 시도해주세요.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
