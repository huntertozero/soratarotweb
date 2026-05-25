const express = require('express');
const cards = require('../data/cards');
const cardImages = require('../data/cardImages');
const { generateReading } = require('../services/claudeService');

const router = express.Router();

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
    const reading = await generateReading(
      spread,
      requestedCards.map(c => ({ id: c.id, isReversed: c.isReversed })),
      question || '',
      cards
    );

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
