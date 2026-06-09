const express = require('express');
const cards = require('../data/cards');
const cardImages = require('../data/cardImages');
const { generateReading } = require('../services/claudeService');
const { sendSlackNotification } = require('../services/slackService');

const router = express.Router();

// ========== 24시간 사용 제한 헬퍼 ==========

const LIMIT_DURATION_MS = 24 * 60 * 60 * 1000;
const LIMIT_SPREADS = ['one', 'three', 'celtic', 'heart'];
const SPREAD_NAMES = { one: '원 카드', three: '쓰리 카드', celtic: '켈틱 크로스', heart: '하트 소나' };
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// IP 기반 서버사이드 사용 기록: Map<ip, Map<spread, timestamp>>
// 쿠키를 삭제해도 서버가 독립적으로 제한을 유지
const ipLimitStore = new Map();

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

// IP 기반 제한: 남은 ms 반환 (0이면 허용)
function getIpRemainingMs(ip, spread) {
  const ipRecord = ipLimitStore.get(ip);
  if (!ipRecord) return 0;
  const timestamp = ipRecord.get(spread);
  if (!timestamp) return 0;
  const remaining = LIMIT_DURATION_MS - (Date.now() - timestamp);
  return remaining > 0 ? remaining : 0;
}

// IP 기반 제한: 사용 기록 저장
function setIpLimit(ip, spread) {
  if (!ipLimitStore.has(ip)) ipLimitStore.set(ip, new Map());
  ipLimitStore.get(ip).set(spread, Date.now());
}

// IP 기반 제한: 특정 IP의 모든 스프레드 기록 삭제 (개발 초기화용)
function clearIpLimit(ip) {
  ipLimitStore.delete(ip);
}

// 질문 필드 sanitize: HTML 태그 및 프롬프트 인젝션에 쓰이는 패턴 제거
function sanitizeQuestion(question) {
  if (!question || typeof question !== 'string') return '';
  return question
    .replace(/<[^>]*>/g, '')           // HTML 태그 제거
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 제어 문자 제거
    .trim();
}

// GET /api/limits - 스프레드별 잠금 상태 반환 (IP + 쿠키 중 더 긴 것 기준)
router.get('/limits', (req, res) => {
  const result = {};
  const ip = req.ip || 'unknown';
  LIMIT_SPREADS.forEach(spread => {
    if (isDevBypass(req)) {
      result[spread] = { locked: false, remainingMs: 0 };
      return;
    }
    const ipRemaining = getIpRemainingMs(ip, spread);
    const cookieRemaining = getRemainingMs(req.cookies[getLimitCookieName(spread)]);
    const remaining = Math.max(ipRemaining, cookieRemaining);
    result[spread] = { locked: remaining > 0, remainingMs: remaining };
  });
  return res.status(200).json(result);
});

// DELETE /api/limits - 모든 제한 초기화 (개발 전용, 쿠키 + IP 스토어 함께 삭제)
router.delete('/limits', (req, res) => {
  if (IS_PRODUCTION) {
    return res.status(403).json({ error: '프로덕션 환경에서는 사용할 수 없습니다.' });
  }
  LIMIT_SPREADS.forEach(spread => res.clearCookie(getLimitCookieName(spread)));
  clearIpLimit(req.ip || 'unknown');
  return res.status(200).json({ message: '모든 제한이 초기화되었습니다.' });
});

// POST /api/reading - 타로 해석 요청 (clarifierCards 포함 시 통합 해석)
router.post('/reading', async (req, res) => {
  try {
    const { spread, question, cards: requestCards, clarifierCards: rawClarifierCards } = req.body;

    // 1. spread 검증
    if (!spread || !['one', 'three', 'celtic', 'heart'].includes(spread)) {
      return res.status(400).json({
        error: '잘못된 spread 타입입니다. "one", "three", "celtic", "heart" 중 하나여야 합니다.',
      });
    }

    // 1-b. 24시간 사용 제한 체크 (IP 우선 → 쿠키 보조)
    if (!isDevBypass(req)) {
      const ip = req.ip || 'unknown';
      const ipRemaining = getIpRemainingMs(ip, spread);
      const cookieRemaining = getRemainingMs(req.cookies[getLimitCookieName(spread)]);
      const remaining = Math.max(ipRemaining, cookieRemaining);
      if (remaining > 0) {
        return res.status(429).json({
          error: `${SPREAD_NAMES[spread]}는 24시간에 1회만 사용할 수 있습니다.`,
          remainingMs: remaining,
        });
      }
    }

    // 2. 카드 수 검증
    const expectedCardCounts = { one: 1, three: 3, celtic: 10, heart: 7 };
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

    // 4. 클라리파이어 카드 검증 (선택사항, 켈틱은 비허용, 최대 2장)
    // 켈틱 크로스는 클라리파이어 비허용
    const clarifierCards = (spread !== 'celtic' && Array.isArray(rawClarifierCards))
      ? rawClarifierCards
      : [];

    if (clarifierCards.length > 2) {
      return res.status(400).json({ error: '추가 카드는 최대 2장입니다.' });
    }

    for (const card of clarifierCards) {
      if (typeof card.id !== 'number' || card.id < 0 || card.id > 77) {
        return res.status(400).json({ error: `잘못된 추가 카드 ID입니다: ${card.id}` });
      }
      if (cardIds.has(card.id)) {
        return res.status(400).json({ error: `추가 카드 ID ${card.id}는 이미 선택된 카드입니다.` });
      }
      cardIds.add(card.id);
    }

    // 5. 질문 sanitize 및 길이 검증
    const sanitizedQuestion = sanitizeQuestion(question);
    if (sanitizedQuestion.length > 200) {
      return res.status(400).json({ error: '질문은 최대 200자입니다.' });
    }

    // 6. 요청 카드의 상세 정보 조회 (isReversed boolean 타입 강제)
    const requestedCards = requestCards.map(rc => {
      const cardData = cards.find(c => c.id === rc.id);
      return {
        id: rc.id,
        isReversed: rc.isReversed === true,
        cardData,
      };
    });

    const requestedClarifierCards = clarifierCards.map(rc => ({
      id: rc.id,
      isReversed: rc.isReversed === true,
      cardData: cards.find(c => c.id === rc.id),
    }));

    // 7. Claude로 해석 생성 (clarifierCards 포함 시 통합 해석)
    const startTime = Date.now();
    const { reading, usage } = await generateReading(
      spread,
      requestedCards.map(c => ({ id: c.id, isReversed: c.isReversed })),
      sanitizedQuestion,
      cards,
      requestedClarifierCards
    );
    const responseTime = Date.now() - startTime;

    // 8. 응답 생성 (카드 정보 + 해석)
    const responseCards = requestedCards.map(rc => ({
      id: rc.id,
      name: rc.cardData.name,
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

    // 클라리파이어 카드 응답 데이터 (있을 때만)
    const responseClarifierCards = requestedClarifierCards.map(rc => ({
      id: rc.id,
      name: rc.cardData.name,
      nameKo: rc.cardData.nameKo,
      isReversed: rc.isReversed,
      imageFile: cardImages[rc.id] || '',
      keywords: rc.isReversed ? rc.cardData.keywords.reversed : rc.cardData.keywords.upright,
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

    // 리딩 성공 → 24시간 제한 기록 (IP 서버사이드 + 쿠키 이중 저장)
    if (!isDevBypass(req)) {
      setIpLimit(req.ip || 'unknown', spread);
      res.cookie(getLimitCookieName(spread), Date.now().toString(), {
        maxAge: LIMIT_DURATION_MS,
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'Lax',
      });
    }

    return res.status(200).json({
      reading,
      cards: responseCards,
      clarifierCards: responseClarifierCards,
    });
  } catch (error) {
    console.error('❌ API 에러:', error.message);

    if (error.message.includes('타임아웃')) {
      return res.status(504).json({
        error: 'Claude API가 응답하지 않습니다. 다시 시도해주세요.',
      });
    }

    return res.status(500).json({
      error: '타로 해석 중 오류가 발생했습니다. 다시 시도해주세요.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
