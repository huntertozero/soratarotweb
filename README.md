# 타로 리딩 웹 애플리케이션

신비로운 AI 기반 타로 리딩 웹 앱입니다. 질문을 입력하면 78장 카드 중 무작위로 선택한 후, Claude AI가 개인화된 한국어 해석을 제공합니다.

## 🌟 핵심 기능

- **78장 전체 덱**: 메이저 아르카나 22장 + 마이너 아르카나 56장
- **3가지 스프레드**: 한 장 뽑기 / 과거·현재·미래(3장) / 켈틱 크로스(10장)
- **AI 해석**: Claude Sonnet 4.6이 신비롭고 개인화된 한국어 해석 제공
- **정방향/역방향**: 모든 카드의 정방향과 역방향 의미 지원
- **신비로운 디자인**: 별이 가득한 우주 테마 + 카드 플립 애니메이션

## 🛠 기술 스택

- **백엔드**: Node.js + Express (API 서버)
- **프론트엔드**: HTML + CSS + JavaScript (번들러 없음, SPA)
- **AI**: Anthropic Claude API
- **기타**: dotenv (환경변수 관리)

## 📋 요구사항

- Node.js v18 이상 (v24.15.0 권장)
- Anthropic API 키 (https://console.anthropic.com/)

## 🚀 빠른 시작

### 1. 프로젝트 설정

```bash
# 의존성 설치
npm install

# .env 파일 생성 및 API 키 입력
# .env.example을 참고하여 .env 파일을 만들고 ANTHROPIC_API_KEY 입력
```

### 2. 서버 실행

```bash
# 시작
npm start

# 또는 개발 중 (파일 변경 시 자동 재시작)
npm run dev
```

### 3. 브라우저 접속

```
http://localhost:3000
```

## 📖 사용 방법

1. **[리딩 시작하기]** 버튼 클릭
2. **스프레드 선택** (한 장 / 3장 / 10장)
3. **질문 입력** (선택사항)
4. **[다음]** 버튼 클릭 → 카드가 섞이고 공개됨
5. **해석 결과** 확인

다시 하기: [다시 리딩하기] 또는 [다른 스프레드 선택]

## 📁 프로젝트 구조

```
tarot-app/
├── server.js                  # Express 서버
├── package.json               # 의존성 정의
├── .env                       # 환경변수 (직접 생성)
├── .gitignore
├── CLAUDE.md                  # 개발 가이드
├── ROADMAP.md                 # 구현 로드맵
│
├── data/
│   └── cards.js               # 78장 카드 데이터
│
├── routes/
│   └── reading.js             # POST /api/reading 라우터
│
├── services/
│   └── claudeService.js       # Claude API 호출
│
└── public/                    # 정적 파일 (브라우저 서빙)
    ├── index.html             # SPA 단일 HTML
    ├── css/
    │   └── style.css          # 신비로운 테마
    ├── js/
    │   ├── app.js             # 상태 관리
    │   ├── cards.js           # 셔플/선택 로직
    │   ├── animation.js       # 플립 애니메이션
    │   └── cardMeta.js        # 경량 카드 메타
    └── img/
        └── cards/             # 카드 이미지 (나중에 추가 가능)
```

## 🔑 API 엔드포인트

### `POST /api/reading`

타로 해석을 요청합니다.

**요청 본문:**
```json
{
  "spread": "one" | "three" | "celtic",
  "question": "당신의 질문 (선택사항, 최대 200자)",
  "cards": [
    { "id": 0, "isReversed": false },
    { "id": 14, "isReversed": true }
  ]
}
```

**응답 (200):**
```json
{
  "reading": "Claude의 한국어 해석 (마크다운 형식)",
  "cards": [
    {
      "id": 0,
      "nameKo": "광대",
      "isReversed": false,
      "position": "현재",
      "keywords": ["새로운 시작", "순수함"]
    }
  ]
}
```

**오류 응답:**
- `400`: 잘못된 요청 (spread 타입, 카드 수, id 범위 등)
- `500`: 서버 오류

## 🎨 테마 색상

| 이름 | 색상코드 | 용도 |
|------|---------|------|
| 심우주 (Void) | #0a0a1a | 배경 최하층 |
| 깊은 우주 | #0f0f2e | 주 배경 |
| 성운 | #1a1040 | 카드 배경 |
| 신비 (Mystic) | #6b21a8 | 메인 퍼플 |
| 신비로운 (Arcane) | #9333ea | 밝은 퍼플 |
| 골드 | #f59e0b | 강조 색상 |
| 은빛 (Silver) | #e2e8f0 | 본문 텍스트 |
| 별빛 (Starlight) | #fef3c7 | 강조 텍스트 |

## ⚙️ 환경변수

`.env` 파일에서 설정합니다.

| 변수 | 설명 | 예시 |
|------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 (필수) | `sk-ant-api03-...` |
| `PORT` | Express 서버 포트 (선택) | `3000` |
| `NODE_ENV` | 환경 설정 (선택) | `development` |

## 🧪 테스트

### API 직접 테스트 (PowerShell)

```powershell
$body = @{
  spread = "one"
  question = "나의 길은?"
  cards = @(
    @{ id = 0; isReversed = $false }
  )
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/reading" `
  -Method Post `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $body
```

### UI 테스트

1. 브라우저에서 `http://localhost:3000` 열기
2. 3가지 스프레드 각각 테스트
3. 카드 플립 애니메이션 확인
4. Claude 해석이 한국어로 표시되는지 확인

## 🐛 문제 해결

### "ANTHROPIC_API_KEY is not set"

`.env` 파일이 있고 올바른 API 키가 입력되었는지 확인하세요.

```bash
# .env 파일 확인
type .env
```

### 서버가 시작되지 않음

포트 3000이 이미 사용 중일 수 있습니다. `.env`에서 `PORT=3001` 등으로 변경해보세요.

### 카드 플립 애니메이션이 안 보임

브라우저 DevTools에서 CSS 설정 확인:
- `perspective` 속성 존재
- `transform-style: preserve-3d` 설정
- `backface-visibility: hidden` 설정

### Claude 응답이 없거나 느림

- 인터넷 연결 확인
- 질문이 200자 이하인지 확인
- API 사용량/rate limit 확인

## 📝 라이센스

MIT

## 🤝 기여

이 프로젝트는 개인용 학습 목적입니다. 개선 사항이나 버그 리포트는 언제든지 환영합니다!

---

**최종 수정**: 2026-05-25
