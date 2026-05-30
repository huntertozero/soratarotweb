# 타로 리딩 웹 애플리케이션

신비로운 AI 기반 타로 리딩 웹 앱입니다. 질문을 입력하면 78장 카드 중 무작위로 선택한 후, Claude AI가 개인화된 한국어 해석을 제공합니다.

## 핵심 기능

- **78장 전체 덱**: 메이저 아르카나 22장 + 마이너 아르카나 56장 (매 진입마다 위치 랜덤화)
- **3가지 스프레드**: 한 장 뽑기 / 과거·현재·미래(3장) / 켈틱 크로스(10장)
- **AI 해석**: Claude Sonnet 4.6이 신비롭고 개인화된 한국어 해석 제공
- **정방향/역방향**: 모든 카드의 정방향과 역방향 의미 지원
- **신비로운 디자인**: Canvas 파티클 배경 + 카드 플립 애니메이션 + 오라클 구체 로딩
- **24시간 사용 제한**: 쿠키 + IP 이중 제한, Railway 다중 사용자 환경 지원
- **보안**: Rate Limiting, CSP/CORS 헤더, DOMPurify XSS 방어, Prompt Injection 필터
- **모니터링**: Slack Incoming Webhook 리딩 알림 (스프레드/카드/토큰/비용/응답시간)
- **Railway 배포**: `railway.toml` 포함, 캐시 버스팅(git 해시) 적용

## 기술 스택

- **백엔드**: Node.js + Express (API 서버)
- **프론트엔드**: HTML + CSS + JavaScript (번들러 없음, SPA)
- **AI**: Anthropic Claude Sonnet 4.6 (`@anthropic-ai/sdk`)
- **보안**: express-rate-limit, cors, DOMPurify (CDN)
- **기타**: dotenv, cookie-parser, marked.js (마크다운 렌더링)

## 요구사항

- Node.js v18 이상 (v24.15.0 권장)
- Anthropic API 키

## 빠른 시작

```bash
# 의존성 설치
npm install

# .env 파일 생성
# ANTHROPIC_API_KEY=sk-ant-api03-...
# PORT=3000 (선택)
# SLACK_WEBHOOK_URL=... (선택, 리딩 알림)
# DEV_TOKEN=임의의_긴_문자열 (선택, /dev 엔드포인트 보호)

# 서버 실행
npm start
```

접속:
- **개발용** (24시간 제한 없음): `http://localhost:3000/dev`
  - `DEV_TOKEN` 설정 시: `http://localhost:3000/dev?token=<값>`
- **일반**: `http://localhost:3000`

개발 중 파일 변경 시 자동 재시작:

```bash
npm run dev
```

## 사용 방법

1. **[무료 리딩 시작하기]** 버튼 클릭
2. **스프레드 선택** (한 장 / 3장 / 켈틱 크로스 10장)
3. **질문 입력** (선택사항, 최대 200자)
4. **[다음]** 버튼 클릭 → 카드 셔플 후 공개
5. **해석 결과** 확인 (마크다운 렌더링)

다시 하기: [다시 리딩하기] 또는 [다른 스프레드 선택]

## 프로젝트 구조

```
tarot-app/
├── server.js                  # Express 설정, /dev 진입점, 캐시 버스팅
├── package.json
├── railway.toml               # Railway 배포 설정
├── .env                       # 환경변수 (직접 생성)
│
├── data/
│   ├── cards.js               # 78장 카드 데이터 (id, nameKo, keywords, meaning)
│   └── cardImages.js          # 카드 ID → 이미지 파일명 매핑
│
├── routes/
│   └── reading.js             # POST /api/reading, GET/DELETE /api/limits
│
├── services/
│   ├── claudeService.js       # Claude API 호출 (스프레드별 max_tokens/timeout)
│   └── slackService.js        # Slack Incoming Webhook 알림
│
├── prompts/
│   ├── system.md              # 공통 시스템 프롬프트
│   ├── one.md                 # 한 장 스프레드 프롬프트
│   ├── three.md               # 3장 스프레드 프롬프트
│   └── celtic.md              # 켈틱 크로스 프롬프트
│
└── public/                    # 정적 파일
    ├── index.html             # SPA 단일 HTML
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js             # 상태 관리, 화면 전환, API fetch
    │   ├── cards.js           # Fisher-Yates 셔플
    │   ├── animation.js       # 카드 플립 (PC/모바일 분기)
    │   ├── effects.js         # 스파크, 파티클, 플립 플래시, 오라클 캔버스
    │   ├── particles.js       # Canvas 별 파티클 배경, 오로라 blob
    │   └── cardMeta.js        # 클라이언트용 경량 카드 배열
    └── img/
        └── cards/             # 카드 이미지
```

## API 엔드포인트

### `POST /api/reading`

**요청 본문:**
```json
{
  "spread": "one" | "three" | "celtic",
  "question": "당신의 질문 (선택사항, 최대 200자)",
  "cards": [
    { "id": 0, "isReversed": false }
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
- `429`: 24시간 사용 제한 초과 또는 Rate Limit 초과
- `500`: 서버 오류

### `GET /api/limits`

현재 사용자의 제한 상태 조회

### `DELETE /api/limits`

사용 제한 초기화 (개발용)

## 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 | 필수 |
| `NODE_ENV` | `production` 고정 (Railway 배포 시) | 필수 |
| `PORT` | Express 서버 포트 (기본: 3000) | 선택 |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL | 선택 |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 (예: `https://your-app.railway.app`) | 프로덕션 필수 |
| `DEV_TOKEN` | `/dev` 엔드포인트 접근 토큰 | 권장 |

## 테스트

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

`npm start` → `http://localhost:3000/dev` 에서 3가지 스프레드 각각 테스트

## 문제 해결

- **API 키 오류** → `.env`의 `ANTHROPIC_API_KEY` 확인
- **카드 이미지 안 보임** → 서버 재시작 + `data/cardImages.js` 확인
- **해석 화면 전환 안 됨** → F12 Console → 에러 모달 메시지 확인 → 서버 재시작
- **포트 충돌** → `.env`에서 `PORT=3001` 등으로 변경

## 라이센스

MIT

---

## 보안

자세한 취약점 분석 및 조치 기록은 [SECURITY.md](./SECURITY.md) 참고.

- Rate Limiting: IP당 분당 20회 / 리딩 시간당 15회
- 24시간 제한: 쿠키 + IP 서버사이드 이중 적용 (쿠키 삭제 우회 불가)
- XSS: DOMPurify로 Claude 응답 sanitize
- CSP / CORS / 보안 헤더 전체 적용

**최종 수정**: 2026-05-31 (Phase 38)
