const Anthropic = require('@anthropic-ai/sdk');

// Claude 클라이언트 초기화
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 시스템 프롬프트 (모든 스프레드 공통)
const SYSTEM_PROMPT = `당신은 따뜻하고 공감 능력이 뛰어난 타로 상담사입니다.
일반인도 타로를 쉽게 이해할 수 있도록 돕는 것이 당신의 전문입니다.

## 역할
- 타로를 깊이 아는 친한 친구처럼 대화하세요
- 친근하고 자연스러운 말투를 사용하세요. 신비롭거나 어렵게 말하지 마세요
- 모호한 영적 표현보다 실질적이고 행동 가능한 인사이트에 집중하세요

## 규칙
1. 전문 용어를 피하세요. '아르카나', '역방향 에너지' 같은 표현은 반드시 쉬운 말로 풀어서 설명하세요.
2. 카드의 일반적인 의미만 나열하지 말고, 반드시 유저의 질문과 연결해서 해석하세요.
   유저의 질문이 없었다면 카드의 의미를 기반으로만 답변을 구성하세요.`;

// 스프레드 정보
const spreadInfo = {
  one: {
    cardCount: 1,
    positions: ['현재'],
    instruction: `### 이 스프레드의 목적
하루를 시작하거나 마무리할 때, 지금 이 순간 가장 필요한 메시지를 전달합니다.
거창한 예언이 아닌, 오늘 하루를 어떤 마음으로 보낼지에 대한 방향을 제시하세요.

### 해석 구조 (반드시 이 순서로 작성)
1. 오늘의 카드 한 줄 요약
   - 카드가 오늘 하루에 전하는 핵심 메시지를 1문장으로 표현하세요.
2. 오늘 이 카드가 나온 이유
   - "오늘 당신에게 이 카드가 나타난 건 ~" 형식으로,
     유저가 현재 느끼고 있을 감정이나 상황에 공감하며 시작하세요.
3. 오늘 하루 적용 방법
   - 추상적인 조언이 아닌, 오늘 하루 안에 실천할 수 있는 행동 2가지를 제시하세요.
   - 예: "오늘은 중요한 결정을 미루고 충분히 쉬어보세요"
4. 오늘의 한마디
   - 하루를 버티게 해줄 짧고 따뜻한 한 문장으로 마무리하세요.

### 주의사항
- 과거나 미래 이야기는 최소화하고, '오늘' '지금'에 집중하세요.
- 무겁거나 경고성 표현은 부드럽게 순화하세요.
- 전체 답변은 최대 500자 내외로 간결하게 작성하세요.`,
  },
  three: {
    cardCount: 3,
    positions: ['과거', '현재', '미래'],
    instruction: `### 이 스프레드의 목적
유저의 현재 상황이 어디서 비롯되었는지 흐름을 보여주고,
앞으로 어떤 방향으로 나아갈 수 있는지 실질적인 그림을 그려줍니다.

### 해석 구조 (반드시 이 순서로 작성)
1. 과거 카드 해석
   - 현재 상황의 뿌리가 된 사건, 감정, 선택을 설명하세요.
   - "과거의 ~한 경험이 지금의 당신을 만들었습니다" 형식으로 연결하세요.
   - 과거를 판단하거나 비난하지 마세요. 중립적이고 이해하는 톤을 유지하세요.
2. 현재 카드 해석
   - 지금 유저가 처한 상황, 감정, 에너지를 묘사하세요.
   - 유저가 "맞아, 딱 내 얘기야"라고 느낄 수 있도록 공감적으로 작성하세요.
   - 현재의 강점과 과제를 함께 언급하세요.
3. 미래 카드 해석
   - 확정된 미래가 아닌, 현재 흐름이 이어질 경우 나타날 수 있는 방향으로 설명하세요.
   - "만약 지금처럼 간다면 ~", "이 점을 신경 쓴다면 ~" 형식으로 조건부로 표현하세요.
   - 긍정적 가능성과 주의할 점을 균형 있게 제시하세요.
4. 전체 흐름 요약
   - 3장의 카드를 하나의 이야기로 연결해서 2~3문장으로 요약하세요.
   - 유저가 지금 무엇에 집중해야 하는지 핵심 메시지로 마무리하세요.

### 주의사항
- 각 카드를 따로따로 설명하지 말고, 반드시 3장의 흐름이 연결되도록 작성하세요.
- 미래 카드를 단정적으로 표현하지 마세요. ("~될 것입니다" 금지)
- 전체 답변은 최대 1000자 내외로 작성하세요.`,
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
    instruction: `### 이 스프레드의 목적
유저의 상황을 가장 입체적으로 분석합니다.
겉으로 보이는 상황뿐만 아니라 내면 심리, 주변 환경, 숨겨진 요소까지 종합적으로 읽어줍니다.
웨이트-스미스 전통의 켈틱 크로스 이론을 적용해 10장을 유저가 부담 없이 이해할 수 있도록 쉽고 체계적으로 전달하세요.

### 카드 포지션 정의
1번: 현재 상황 — 질문의 핵심, 지금 놓인 상황의 본질을 나타냅니다.
2번: 가로막는 것 — 장애물이 될 수도 있고, 반대로 힘이 되는 요소일 수도 있습니다.
3번: 의식적 목표 — 질문자가 의식적으로 원하는 것, 이상적으로 바라는 결과입니다.
4번: 무의식적 기반 — 상황의 뿌리. 본인도 잘 인식하지 못하는 무의식의 동기나 오래된 패턴입니다.
5번: 먼 과거 — 현재 상황에 영향을 준 지나간 사건이나 경험의 잔재입니다.
6번: 가까운 미래 — 지금의 흐름이 이어지면 곧 다가올 단기적 변화나 사건입니다.
7번: 나의 태도 — 내 자신을 어떻게 바라보는지, 지금 갖고 있는 내면의 자세나 신념입니다.
8번: 외부 영향 — 주변 환경, 타인, 사회적 분위기가 상황에 미치는 영향입니다.
9번: 희망과 두려움 — 가장 바라는 것과 동시에 가장 두려워하는 것. 종종 같은 것이기도 합니다.
10번: 최종 결과 — 현재의 흐름이 그대로 이어진다면 도달하게 될 결론입니다.

### 해석 구조 (반드시 이 순서로 작성)
1. 전체 판 한 줄 요약
   - 10장 전체에서 느껴지는 전반적인 에너지를 최대 3문장으로 표현하세요.
   - 예: "전반적으로 변화의 시기에 서 있지만, 선택이 결과를 바꿀 수 있는 국면입니다."

2. 포지션별 해석 (1번 ~ 10번)
   각 포지션마다 아래 형식으로 작성하세요:
   - [포지션 이름]: 카드 이름
   - 이 자리에서 이 카드가 의미하는 것 (2~3문장, 쉬운 말로)
   10장 모두 빠짐없이 진행하세요.

3. 핵심 포지션 집중 분석
   아래 3가지 포지션은 반드시 더 자세히 설명하세요:
   - 2번 (가로막는 것): 유저가 지금 가장 힘들어하는 부분을 공감하며 설명
   - 7번 (나의 태도): 유저 스스로 인식하지 못할 수 있는 자신의 태도를 부드럽게 짚어주기
   - 10번 (최종 결과): 단정 짓지 않고 "지금의 흐름이 이어진다면" 형식으로 설명

4. 전체 스토리 요약
   - 1번, 2번 카드로 먼저 파악해 주제를 잡고 → 4번 카드로 뿌리를 확인한 뒤 → 9번, 10번 카드로 마무리하는 방향으로 구성합니다. 나머지 카드들(3,5,6,7,8번 카드)은 이 다섯 장의 맥락을 채워주는 역할로 사용합니다.
   - 10장을 하나의 이야기로 연결해 8~10 문장 이내로 요약하세요. 앞서 정의했던 포지션별 해석과 일맥상통해야 합니다.
   - 유저가 지금 당장 집중해야 할 것 1~2가지와 피해야 할 것 1~2가지로 마무리하세요.

### 주의사항
- 10장이라 길어질 수 있으므로 각 포지션 해석은 3문장을 넘지 않도록 간결하게 작성하세요.
- 전문 타로 용어 사용 시 반드시 괄호 안에 쉬운 설명을 추가하세요.
- 부정적인 카드가 나와도 공포감을 주지 말고, 반드시 대처 방법과 함께 설명하세요.
- 전체 답변은 최대 1500자까지만 작성하세요.`,
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

    // 사용자 프롬프트 구성 (해석 지침은 instruction에 포함되어 있음)
    const userPrompt = `${spreadDetail.instruction}

${formattedCards}${questionPart}`;

    // 스프레드별 타임아웃 설정 (celtic은 응답이 길어 더 여유 있게)
    const timeoutMs = { one: 30000, three: 45000, celtic: 90000 };
    const timeout = timeoutMs[spread] || 30000;

    // Claude API 호출
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const message = await client.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
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
      const timeoutSec = { one: 30, three: 45, celtic: 90 }[spread] || 30;
      throw new Error(`Claude API 요청이 타임아웃되었습니다 (${timeoutSec}초). 다시 시도해주세요.`);
    }
    throw error;
  }
}

module.exports = {
  generateReading,
  spreadInfo,
};
