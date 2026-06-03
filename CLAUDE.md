# 타로 리딩 웹 애플리케이션 - 개발 가이드

## 프로젝트 개요

로컬 + Railway 배포용 AI 기반 타로 리딩 웹 앱.

- **스택**: Node.js/Express + HTML/CSS/JS (번들러 없음)
- **AI 모델**: Claude Sonnet 4.6
- **실행**: `npm start` / 개발용: `http://localhost:3000/dev` (24시간 제한 없음)

> 완료된 Phase 1~47 상세 이력 → **DONE.md** 참고

---

## 개발 규칙

- **코드 주석**: 한국어 (WHY가 불명확할 때만)
- **커밋**: 한국어, 파일/기능 완성 후 즉시 (배치 커밋 금지)
- **UI 텍스트**: 한국어 / **변수·함수명**: 영어
- **API 키**: `.env`에만, 프론트엔드 노출 금지
- **카드 데이터**: 서버 `data/cards.js` (78장 전체) / 클라이언트 `public/js/cardMeta.js` (경량)

---

## 현재 상태 (Phase 48 완료)

| 영역 | 완료 내용 |
|------|-----------|
| 백엔드 | Express API, 24시간 사용 제한(쿠키 + IP 이중), 스프레드별 타임아웃/토큰 분리, 3카드 max_tokens 2500 |
| 클라리파이어 | `/api/reading`에 `clarifierCards` 통합, 단일 Claude 호출 통합 해석, 켈틱 비허용, 중복 방어 |
| 프론트엔드 | 78장 선택(매 진입마다 위치 랜덤화), 카드 플립, READING 3열 레이아웃, marked.js + DOMPurify 마크다운(로컬 번들) |
| 클라리파이어 UI | CARD_REVEAL 오라클 전 `#clarifier-before-reading` 카드 선택 UI, 조건 A/B/D 클라이언트 감지, 제목에 카드 장수 동적 표시, 카운터 제거, reason 가운데 정렬 |
| 애니메이션 | Canvas 파티클 배경, 오라클 구체 로딩, 카드 스파크/플래시, 웰컴 덱 아이콘 룬 궤도 |
| 모바일 | 반응형 레이아웃 전면 개선, 화면별 상단 여백 정렬, shuffle-info fixed 고정, 진입 애니메이션 버그 수정 |
| 모바일 UX | READING 카드 목록 자동 스크롤 힌트 (8초 우→2초 대기→8초 좌 복귀, 터치 시 취소), SHUFFLE 진입 시 스크롤 최상단 강제 보정 (`history.scrollRestoration = 'manual'` + rAF 재보정) |
| UX 흐름 | 원 카드 선택 시 INPUT_QUESTION 화면 스킵, 바로 SHUFFLE 진입 / 셔플 뒤로가기 → 원 카드면 SELECT_SPREAD 복귀 |
| 프롬프트 | `prompts/*.md` 파일 분리, 이미지·역방향·연관성 원칙 포함, 한글명 단일 소스 지시, 클라리파이어 프롬프트 추가 |
| UX | 켈틱 크로스 카드 번호 뱃지, 켈틱 로딩 자동 스크롤, 웰컴 subtitle 수직 중앙 정렬, 텍스트 전면 개선 |
| UX | 카드 줌 팝업(위치레이블→카드명→키워드 순), 잠금 해제 시각 표시, 질문 입력 화면 제목 PC 줄바꿈 방지 |
| UX | 웰컴 화면 면책 문구 추가 (개인정보 미수집·무료 고지, 버튼 하단 80px 여백 흐린 이탤릭) |
| UX | 웰컴 화면 타이틀 "크리시엘 타로 리딩"으로 변경, SELECT_SPREAD 진입 시 쓰리 카드 기본 선택 (모바일 슬라이더 — three잠금→one, 둘다잠금→celtic fallback) |
| 모바일 UX | h2·#shuffle-message 폰트 10% 축소(32/25px) + 가운데 정렬, .question-hint·shuffle 부가설명 줄바꿈, .spread-subtitle 문구 개선("24시간 제한" gold 강조) |
| 카드 한글명 | `data/cards.js` nameKo 한글화(지팡이/컵/칼/동전), API `name`+`nameKo` 동시 응답, 팝업·해석 텍스트 일치 |
| 코드 품질 | Dead code 제거, 중복 로직 정리, 디버그 로그 제거, CARD_NAMES_KO 상수 제거, `fetchReading` loadingState 통합·stopLoading 헬퍼, `updateCardSelectionUI` Set 최적화, claudeService 스프레드 상수 분리, reading 클라리파이어 이중 조회 제거 |
| 배포 | `railway.toml` 생성, 캐시 버스팅(git 해시+dirty 타임스탬프 `?v=`), JS/CSS 1년 캐시, HTML no-cache |
| 모니터링 | Slack Incoming Webhook 리딩 알림 (스프레드/질문/카드/토큰/비용/응답시간/접속정보) |
| 보안 | Rate Limiting, IP 기반 24시간 제한, CSP/CORS/보안헤더(cdn.jsdelivr.net script-src 제거), DOMPurify XSS 방어, Prompt Injection 필터, /dev 토큰 게이트 |
| 문서 | `SECURITY.md` 생성 (9개 취약점 전체 조치 기록), `SCREENS.md`, `README.md`, `ROADMAP.md` 현행화 |

---

## 파일별 책임

| 파일 | 역할 |
|------|------|
| `server.js` | Express 설정, CORS/CSP/보안헤더, Rate Limiting, `/dev` 토큰 게이트, 캐시 버스팅, 에러 핸들러 |
| `data/cards.js` | 78장 카드 데이터 (id, name 영문, nameKo 한글, keywords, meaning, imageSymbols) |
| `data/cardImages.js` | 카드 ID → 이미지 파일명 매핑 |
| `routes/reading.js` | `GET/DELETE /api/limits`, `POST /api/reading` (IP+쿠키 이중 제한, Prompt Injection 필터, isReversed 검증, clarifierCards 통합) |
| `prompts/*.md` | system / one / three / celtic / clarifier — 서버 재시작 없이 즉시 반영 |
| `services/claudeService.js` | Claude API 호출 (스프레드별 max_tokens / timeout), `generateReading(clarifierCards)`, `formatClarifierCardsForPrompt()` |
| `services/slackService.js` | Slack Incoming Webhook 알림 (리딩 성공 시 비동기 전송) |
| `public/js/app.js` | 상태 관리, 화면 전환, API fetch, IS_DEV_MODE(meta 태그 감지), 모바일 카드 자동 스크롤 힌트, 브라우저 스크롤 복원 비활성화, 원 카드 INPUT_QUESTION 스킵, 클라리파이어 클라이언트 로직, SELECT_SPREAD 기본 슬라이드(`applyDefaultSpreadSlide`) |
| `public/js/vendor/` | marked.min.js + purify.min.js 로컬 번들 (CDN 의존 제거) |
| `public/js/animation.js` | 카드 플립, PC/모바일 순서 분기 |
| `public/js/effects.js` | 스파크, 지속 파티클, 플립 플래시, 오라클 캔버스 |
| `public/js/particles.js` | Canvas 별 파티클 배경, 오로라 blob |
| `public/js/cards.js` | Fisher-Yates 셔플 (`shuffleArray`) |
| `railway.toml` | Railway 배포 설정 (NIXPACKS, 헬스체크, 재시작 정책) |
| `public/js/cardMeta.js` | 클라이언트용 경량 카드 배열 (id, nameKo, suit, imageFile) |
| `SECURITY.md` | 보안 취약점 분석 및 조치 기록 (9개 항목) |

---

## 테스트

```powershell
# API 단독 테스트
$body = @{ spread = "one"; question = "나의 길은?"; cards = @(@{ id = 0; isReversed = $false }) } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/reading" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body $body
```

UI: `npm start` → `http://localhost:3000/dev` (3가지 스프레드 각각 테스트)

---

## 문제 해결

- **API 키 오류** → `.env`의 `ANTHROPIC_API_KEY` 확인
- **READING 카드 이미지 안 보임** → 서버 재시작 필요 + `data/cardImages.js` 존재 확인
- **해석 화면 전환 안 됨** → F12 Console 확인 → 에러 모달 메시지 확인 → 서버 재시작
- **429 Too Many Requests** → Rate Limit 초과 (분당 20회 / 시간당 15회 리딩)
- **/dev 접근 안 됨** → `DEV_TOKEN` 환경변수 확인 후 `/dev?token=<값>` 으로 접근

---

## 남은 작업

### ⭐ 우선순위 낮음
- 배경 음악 추가
- 프리셋 질문 버튼, 리딩 히스토리(localStorage), 다크/라이트 테마, 카드 플립 효과음
- 결과 공유 (클립보드 복사 또는 URL)
- 클라리파이어 AI 신호 남용 모니터링 (정방향 평범한 리딩에서도 간헐 발동)

---

## 참고

- 환경: Windows 11, Node.js v24.15.0
- 개발 진입점: `http://localhost:3000/dev` (DEV_TOKEN 설정 시 `?token=<값>` 필요)
- 배포 진입점: `http://localhost:3000/` (제한 적용, Railway용)

### Railway 필수 환경변수

| 변수 | 설명 |
|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `NODE_ENV` | `production` 고정 |
| `SLACK_WEBHOOK_URL` | Slack 알림 Webhook |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 (예: `https://soratarotweb.up.railway.app`) |
| `DEV_TOKEN` | /dev 엔드포인트 접근 토큰 (미설정 시 /dev 비공개 권장) |
