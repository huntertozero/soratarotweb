const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Claude 클라이언트 초기화
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// prompts/ 폴더 경로
const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

// 프롬프트 파일을 요청마다 새로 읽음 (파일 수정 후 서버 재시작 불필요)
function loadPrompt(filename) {
  const filePath = path.join(PROMPTS_DIR, filename);
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    throw new Error(`프롬프트 파일을 읽을 수 없습니다: ${filePath}\n${err.message}`);
  }
}

// 스프레드 정보 (포지션 이름은 코드에서 관리, 프롬프트 내용은 prompts/*.md에서 관리)
const spreadInfo = {
  one: {
    cardCount: 1,
    positions: ['현재'],
    promptFile: 'one.md',
  },
  three: {
    cardCount: 3,
    positions: ['과거', '현재', '미래'],
    promptFile: 'three.md',
  },
  celtic: {
    cardCount: 10,
    positions: [
      '현재 상황',
      '가로막는 것',
      '의식적 목표',
      '무의식적 기반',
      '먼 과거',
      '가까운 미래',
      '나의 태도',
      '외부 영향',
      '희망과 두려움',
      '최종 결과',
    ],
    promptFile: 'celtic.md',
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
      // imageSymbols가 있을 때만 줄 추가 (마이너 카드 중 미작성분도 깔끔하게 처리)
      const imageSymbols = cardData.imageSymbols
        ? `\n- 이미지 묘사: ${cardData.imageSymbols}` : '';
      // 마이너 카드는 수트 정보 추가
      const suitInfo = cardData.suit ? ` / ${cardData.suit}` : '';

      return `
**위치 ${index + 1}: ${positions[index] || `위치 ${index + 1}`}**
- 카드: ${cardData.name} (${cardData.nameKo}) ${direction}
- 원소: ${cardData.element}${suitInfo}
- 핵심 키워드: ${keywords}${imageSymbols}
- 의미: ${meaning}`;
    })
    .join('\n');
}

// 클라리파이어 카드 섹션 포맷팅 (통합 해석용)
function formatClarifierCardsForPrompt(clarifierCards, cardDatabase) {
  if (!clarifierCards || clarifierCards.length === 0) return '';

  const cardsText = clarifierCards.map((card, i) => {
    const cardData = cardDatabase.find(c => c.id === card.id);
    if (!cardData) return '';
    const direction = card.isReversed ? '역방향' : '정방향';
    const keywords = card.isReversed
      ? cardData.keywords.reversed.join(', ')
      : cardData.keywords.upright.join(', ');
    const imageSymbols = cardData.imageSymbols
      ? `\n- 이미지 묘사: ${cardData.imageSymbols}` : '';
    return `**카드: ${cardData.name} (${cardData.nameKo}) ${direction}**\n- 핵심 키워드: ${keywords}${imageSymbols}`;
  }).filter(Boolean).join('\n\n');

  return `\n\n**✦ 추가 카드 (클라리파이어)**\n${cardsText}`;
}

// Claude로 타로 해석 생성 (clarifierCards 포함 시 통합 해석)
async function generateReading(spread, cards, question, cardDatabase, clarifierCards = []) {
  // 클라리파이어 카드가 있으면 타임아웃/토큰 소폭 증가
  const hasClarifier = clarifierCards.length > 0;
  const timeout = ({ one: 30000, three: 45000, celtic: 90000 })[spread] || 30000;
  const baseTokens = ({ one: 1024, three: 2500, celtic: 4000 })[spread] || 1024;
  const maxTokens = hasClarifier ? Math.min(baseTokens + 600, 4096) : baseTokens;

  try {
    // 스프레드 정보
    const spreadDetail = spreadInfo[spread];

    // 프롬프트 파일을 요청마다 새로 읽음 (저장 즉시 반영)
    const systemPrompt = loadPrompt('system.md');
    const spreadInstruction = loadPrompt(spreadDetail.promptFile);

    // 카드 정보 포맷팅
    const formattedCards = formatCardsForPrompt(cards, cardDatabase, spread);

    // 클라리파이어 카드 섹션 (있을 때만 추가)
    const clarifierSection = formatClarifierCardsForPrompt(clarifierCards, cardDatabase);

    // 질문 포함 여부
    const questionPart = question
      ? `\n\n사용자의 질문: "${question}"`
      : '';

    // 사용자 프롬프트 구성
    const userPrompt = `${spreadInstruction}

${formattedCards}${clarifierSection}${questionPart}`;

    // AbortController로 타임아웃 구현
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const message = await client.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: systemPrompt,
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

    const reading = message.content[0].type === 'text' ? message.content[0].text : '';

    return { reading, usage: message.usage };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Claude API 요청이 타임아웃되었습니다 (${timeout / 1000}초). 다시 시도해주세요.`);
    }
    throw error;
  }
}

module.exports = {
  generateReading,
  spreadInfo,
};
