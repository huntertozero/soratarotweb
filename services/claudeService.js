const Anthropic = require('@anthropic-ai/sdk');

// Claude 클라이언트 초기화
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 시스템 프롬프트 (모든 스프레드 공통)
const SYSTEM_PROMPT = `당신은 수십 년 경험의 신비로운 타로 마스터입니다. 당신의 역할:

1. 정방향과 역방향 에너지를 명확하게 구분하여 해석합니다
2. 카드 간의 서사적 흐름과 상호작용을 찾아냅니다
3. 사용자를 판단하지 않고 가능성과 성찰의 길을 제시합니다
4. 신비롭고 시적인 한국어로 표현합니다
5. 마크다운 형식으로 답변하되, 각 섹션을 명확하게 구분합니다

답변 스타일:
- 너무 길지 않게 (300~500단어)
- 카드의 상징성과 개인의 상황을 연결합니다
- 긍정적이면서도 현실적인 통찰을 제공합니다`;

// 스프레드 정보
const spreadInfo = {
  one: {
    cardCount: 1,
    positions: ['현재'],
    instruction: '하나의 카드만 뽑았습니다. 이것은 현재 상황과 에너지를 나타냅니다.',
  },
  three: {
    cardCount: 3,
    positions: ['과거', '현재', '미래'],
    instruction: '3장의 카드를 뽑았습니다. 각각 과거, 현재, 미래의 시간 흐름을 나타냅니다.',
  },
  celtic: {
    cardCount: 10,
    positions: [
      '현재 상황 (중심)',
      '도전/영향 (교차)',
      '원하는 결과 (상단)',
      '심층 근원 (하단)',
      '최근 과거 (좌측)',
      '가까운 미래 (우측)',
      '당신의 입장 (위)',
      '주변 환경 (아래)',
      '희망/두려움 (우상단)',
      '최종 결과 (우하단)',
    ],
    instruction: '켈틱 크로스 스프레드로 10장의 카드를 뽑았습니다. 이것은 상황의 모든 측면을 깊이 있게 드러냅니다.',
  },
};

// 카드 정보를 문자열로 포맷팅
function formatCardsForPrompt(cards, cardDatabase, spread) {
  const positions = spreadInfo[spread].positions;

  return cards
    .map((card, index) => {
      const cardData = cardDatabase.find(c => c.id === card.id);
      if (!cardData) return '';

      const direction = card.isReversed ? '역방향' : '정방향';
      const keywords = card.isReversed
        ? cardData.keywords.reversed.join(', ')
        : cardData.keywords.upright.join(', ');
      const meaning = card.isReversed
        ? cardData.reversedMeaning
        : cardData.uprightMeaning;

      return `
**위치 ${index + 1}: ${positions[index] || `위치 ${index + 1}`}**
- 카드: ${cardData.nameKo} (${direction})
- 키워드: ${keywords}
- 의미: ${meaning}`;
    })
    .join('\n');
}

// Claude로 타로 해석 생성
async function generateReading(spread, cards, question, cardDatabase) {
  try {
    // 스프레드 정보
    const spreadDetail = spreadInfo[spread];

    // 카드 정보 포맷팅
    const formattedCards = formatCardsForPrompt(cards, cardDatabase, spread);

    // 질문 포함 여부
    const questionPart = question
      ? `\n\n사용자의 질문: "${question}"`
      : '';

    // 사용자 프롬프트 구성
    const userPrompt = `${spreadDetail.instruction}

${formattedCards}${questionPart}

위의 카드들을 보고, 이들이 사용자의 상황과 에너지에 어떤 메시지를 전하는지 깊이 있고 신비롭게 해석해주세요.
${
  spread === 'celtic'
    ? '켈틱 크로스의 각 위치의 의미를 반영하여 전체적인 흐름과 조언을 제시해주세요.'
    : '카드들 사이의 연결고리와 미래로의 흐름을 보여주세요.'
}`;

    // Claude API 호출 (30초 타임아웃)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const message = await client.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    // 응답 처리
    const reading = message.content[0].type === 'text' ? message.content[0].text : '';

    return reading;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Claude API 요청이 타임아웃되었습니다 (30초). 다시 시도해주세요.');
    }
    throw error;
  }
}

module.exports = {
  generateReading,
  spreadInfo,
};
