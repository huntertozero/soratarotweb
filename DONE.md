# 완료된 구현 이력

> 현재 활성 개발 가이드는 CLAUDE.md를 참고하세요.

---

## Phase 1: 기반 구조 ✅
- npm install (3개 의존성), `.env`, `.gitignore`, `server.js` 기본 구조, `public/index.html` 최소 마크업

## Phase 2: 카드 데이터 ✅
- `data/cards.js` - 메이저 아르카나 22장 + 마이너 아르카나 56장
- `public/js/cardMeta.js` - 경량 메타데이터

## Phase 3: 백엔드 API ✅
- `services/claudeService.js`, `routes/reading.js`, `server.js` 라우터 연결, API 단독 테스트

## Phase 4: 프론트엔드 UI ✅
- `public/css/style.css`, `public/index.html` 화면 마크업, `public/js/app.js` 화면 전환, `public/js/cards.js` 셔플

## Phase 5: 애니메이션 + 통합 ✅
- `public/js/animation.js` 카드 플립, API 연동, 마크다운 렌더링, 반응형 CSS

## Phase 6: UI/UX 개선 ✅
- 스프레드 문구/아이콘 개선, 버튼 위치 고정, 78장 카드 그리드, 직접 선택 기능
- 카드 선택 애니메이션, CARD_REVEAL 2.5:4 비율, 역방향 표현, 스프레드별 레이아웃

## Phase 7: 카드 이미지 및 애니메이션 완성 ✅
- 78장 이미지 추가, 하이라이트 스캔 플립 애니메이션, 카드 이름 영문 국제화
- Reverse 이미지 상하반전, 포지션 텍스트(과거/현재/미래, Celtic Cross) 플립 후 유지

## Phase 8: 해석 결과 화면 최적화 ✅
- READING 화면 3열 레이아웃 (좌측 카드 | 중앙 해석 | 우측 카드)
- 좌우 컬럼 `position: fixed`, 카드 이미지 + 오버레이, 높이 동기화
- 백엔드 `meaning` 필드 응답 추가

## Phase 9: READING 화면 카드 버그 수정 ✅
- `data/cardImages.js` 신규 생성 (카드 ID → 이미지 파일명 매핑)
  - 근본 원인: `data/cards.js`에 imageFile 없어 `/img/cards/undefined` 로딩 실패
- `routes/reading.js` imageFile 정상 응답, Reverse scaleY(-1) 처리
- 카드 상단 위치 레이블 추가, 높이 동기화 타이밍 버그 수정 (`requestAnimationFrame`)
- CSS 카드 클래스 재정의: `csm-*` 네이밍, `isolation: isolate`, 스크롤바 숨김

## Phase 10: Claude 프롬프트 개선 (일반인 친화적) ✅
- `SYSTEM_PROMPT` 따뜻한 타로 상담사 페르소나, 전문 용어 금지
- `one` 4단계 구조 (500자), `three` 4단계 (1000자), `celtic` 4단계 (1500자)
- `max_tokens` 1024 → 2000

## Phase 11: 버그 수정 및 켈틱 크로스 프롬프트 고도화 ✅
- 에러 모달 버그: `style="display: none;"` 인라인 스타일 제거 (CSS `.modal.active` 우선순위 문제)
- `fetchReading()` 방어 코드, `displayReading()` try-catch 강화
- 켈틱 크로스 포지션 명칭 전면 개정 (웨이트-스미스 전통 반영):
  - 2번: 장애물 → 가로막는 것 / 3번: 근본 원인 → 의식적 목표
  - 4번: 가까운 과거 → 무의식적 기반 / 5번: 가능성 → 먼 과거
  - 7번: 내 태도 → 나의 태도 / 8번: 외부 환경 → 외부 영향
  - 9번: 희망 또는 두려움 → 희망과 두려움
- celtic instruction: 전체 판 요약 1→3문장, 포지션 10장 모두 명시, 스토리 8~10문장

## Phase 12: 10장 토큰 한도 확장 + 해석 화면 UX 개선 ✅
- `max_tokens` 스프레드별 분리: `one` 1024 / `three` 1500 / `celtic` 4000
- 타임아웃 분리: `one` 30초 / `three` 45초 / `celtic` 90초
- 로딩 메시지 차별화 (스프레드별 소요시간 안내)
- 해석 화면 상단 질문 표시 (`#reading-question`, `.reading-question` 파란 테두리 박스)

## Phase 13: 마크다운 렌더러 교체 + 프롬프트 고도화 ✅
- `simpleMarkdownToHtml` 정규식 방식 → `marked.js` CDN(v12) 교체 (`breaks: true`)
- 프롬프트 파일 분리: `prompts/system.md`, `one.md`, `three.md`, `celtic.md`
  - 서버 재시작 없이 파일 저장 즉시 반영 (`fs.readFileSync`)
- `system.md`: 이미지 해석 원칙, 정역방향 원칙, 카드 간 연관성 원칙 추가
- `one.md` 5단계 (600자), `three.md` 5단계 (1200자), `celtic.md` 이미지·방향 원칙 섹션 (2000자)

## Phase 14: 카드 데이터 최적화 ✅
- `data/cards.js` 미사용 `description` 필드 제거 (메이저 아르카나 22장)
- 78장 모두 `imageSymbols` 필드 추가 (웨이트-스미스 덱 상징물, AI 이미지 기반 해석용)

## Phase 15: 24시간 사용 제한 + Railway 배포 준비 ✅
- 스프레드별 24시간 1회 제한: `cookie-parser`, `tarot_limit_{spread}` httpOnly 쿠키
- `GET /api/limits`, `DELETE /api/limits` (개발 전용), 429 응답 + remainingMs
- `/dev` 개발 진입점: `window.TAROT_APP_MODE = "dev"` 주입 → 제한 UI 스킵
- `IS_PRODUCTION=true`이면 `X-Tarot-Dev` 헤더 무시 (Railway 보안)
- `.spread-card.locked` 잠금 스타일, `.spread-countdown` z-index 2

## Phase 16: 24시간 제한 쿠키 만료 버그 수정 ✅
- `maxAge: 86400` → `maxAge: 86400 * 1000` (Express `maxAge`는 밀리초 단위)
  - 증상: 해석 완료 후 86초만에 쿠키 만료 → 잠금이 풀리는 것처럼 보임

## Phase 17: `/sync` 커스텀 슬래시 커맨드 추가 ✅
- `.claude/commands/sync.md`: 세션 작업 → CLAUDE.md 새 Phase 기록 → `git push` 자동화

## Phase 18: 프론트엔드 애니메이션 강화 + UI 세부 조정 ✅

### 18-1. 동적 배경 파티클 시스템
- `public/js/particles.js`: 150개 별 파티클(반짝임/흐름/마우스 반응), 오로라 blob 3개
- 화면 전환 시 폭발 후 lerp 복귀, 모션 블러, `prefers-reduced-motion` 성능 안전망

### 18-2. 카드 이펙트 + 오라클 구체 로딩 UI
- `public/js/effects.js`:
  - `triggerCardSpark()`: 28개 물리 기반 파티클, `MAX_SPARKS = 200` 누적 방지
  - `startSelectedCardParticles()`: 선택 카드 180ms 소형 파티클 위로 흐름
  - `triggerFlipFlash()`: 카드 개별 오버레이 (`.card-item overflow:hidden` 클리핑)
  - `startOracleAnimation()`: Canvas 2D 수정구슬 — 외부 글로우 + 룬 기호 타원 궤도 (원근감)
- `<div class="spinner">` → `<canvas class="oracle-canvas">` 교체

### 18-3. UI 세부 조정
- 스파크 속도: `3~10 px/f → 1~3.5 px/f`, 중력 `0.22 → 0.06`
- 오라클 캔버스 200×200 → 320×320 (글로우 네모 클리핑 버그 수정)
- textarea `margin-bottom: 12px → 4px`, '질문 없이 진행하기' 링크 제거
- '선택사항' 텍스트 주황색(`--color-gold`)

## Phase 19: 모바일 최적화 — 반응형 레이아웃 전면 개선 ✅
- SHUFFLE 카드 그리드: 고정 13열 → breakpoint별 9/7/6열, 아이콘 40px → 18px
- `touch-action: manipulation`, `.btn min-height: 48px`
- READING 모바일: 3열 → 1열, 좌우 카드 `position: static` + 가로 스크롤
- `_syncLayoutHandler` 모듈 레벨로 메모리 누수 수정
- CARD_REVEAL: `width: 200px` → `max-width: 200px`
- `body` 768px 이하 `align-items: flex-start`

## Phase 20: 카드 선택 화면 UX 개선 및 버그 수정 ✅
- `cardGlow 2s → 0.6s` (렉 착각 해소)
- `shuffle-info` sticky 고정 (선택 카운트 항상 상단 표시), 투명 배경 + text-shadow
- SHUFFLE/질문입력 버튼 수평 배치 고정 (`flex-direction: row`, `flex: 1`)
- 스프레드 선택 "이전으로" `<div class="button-group">` 감싸기
- 카드 선택 취소 hover 고착 버그: `.no-hover` 클래스 250ms 부착으로 해결

## Phase 22: 웰컴 화면 초기 렌더링 일관성 및 반응형 개선 ✅
- Critical CSS 인라인: 외부 CSS 로드 전 웰컴 화면 정확 렌더링
- 모바일 768px: 제목 32px, 부제목 18px, 아이콘 80×107
- 480px: 제목 28px, 아이콘 72×96, 테두리 1.5px
- 인라인 `.btn` 스타일 제거 → `.btn-secondary` 정상 적용

## Phase 23: 모바일 UI/UX 세부 개선 및 카드 떨림 효과 ✅
- 버튼 고정 개선: `_lastCardIntersecting` + `updateShuffleButtonPin()` 선택 완료 감지
- 모든 제목 `Noto Serif KR`, 48/36/28px 통일 (`!important`)
- 스프레드 선택 황금색 후광 `spreadGlow` 2초 펄싱
- `cardShiver` 애니메이션: 1~2장만 랜덤 떨림, 1초마다 교체
- 카드 테두리 2px → 1px

## Phase 24: 모바일 CARD_REVEAL 화면 레이아웃 재구성 ✅
- 원 카드: `max-width: 150px` / 쓰리 카드: `repeat(3, 1fr)` / 켈틱: 12열 3+3+4
- 오라클 캔버스 모바일 CSS `width/height: 160px` (내부 320px 유지)
- 카드 텍스트 단계적 축소: 쓰리/켈틱 3행 8/7/7px, 켈틱 4행 7/6/6px
- 컨테이너 패딩 40px → 20px

## Phase 25: 모바일 켈틱 크로스 카드 겹침 수정 및 레이아웃 재배치 ✅
- `.card-item { height: 200px }` → `height: auto` (aspect-ratio 무시 버그 수정)
- `width: 100%` 명시로 그리드 셀 초과 겹침 수정
- 켈틱 크로스 3+3+2+2 배치 (`grid-row` 명시):
  - 1행: 1·3·4번 / 2행: 5·6·8번 / 3행: 2·7번 / 4행: 9·10번
- 플립 순서 변경: `[0, 2, 3, 4, 5, 7, 1, 6, 8, 9]`
- 로딩 소요시간 수정: 1장 20초 / 3장 30초 / 켈틱 40초

## Phase 26: 켈틱 크로스 플립 순서 분기 + 모바일 카드 텍스트 최적화 ✅
- PC(>768px): 1→2→3→…→10 / 모바일(≤768px): 1→3→4→5→6→8→2→7→9→10 분기
- CARD_REVEAL 카드 텍스트 실제 적용 버그 수정:
  - `animation.js` 인라인 스타일 → `.card-position-label` / `.card-position-label--reversed` CSS 클래스
  - 모바일 768px: `.card-name` 10px / `.card-direction` 9px / `.card-position-label` 9px
- READING 화면 모바일: `csm-direction` 8px 추가

## Phase 27: 카드 위치 랜덤화 + 켈틱 크로스 카드 번호 태그 뱃지 ✅

### 27-1. SHUFFLE 화면 카드 위치 랜덤화
- `createCardGrid()` (`app.js`): 0→77 고정 순서 → `shuffleArray()` 로 매 진입마다 78장 시각적 순서 랜덤화
- 기존 `shuffleArray()` (`cards.js`) 재사용, 논리적 `data-card-id`는 유지

### 27-2. 켈틱 크로스 READING 화면 카드 번호 뱃지
- 1차: 대각선 코너 리본 (`transform: rotate(-45deg)`) 구현
- 2차: 수평 화살표 태그로 개선 (`clip-path: polygon` 펜타곤, 높이 18px, 좌측 4px 돌출)
  - `overflow: hidden` → `overflow: visible` (`#screen-reading.spread-celtic .card-summary-item`)
  - 모바일: 높이 16px / 돌출 3px, 기존 gap 10px 유지 (7px 여백 확보)

## Phase 28: UX 세부 개선 ✅
- 켈틱 크로스 카드 10장 플립 완료 후 로딩 인디케이터가 화면 밖에 위치하는 문제 → 로딩 활성화 시 `scrollTo(0, scrollHeight)` 자동 스크롤
- 모바일 웰컴 화면 "리딩 시작하기" 버튼: 내용 맞춤 폭 → `width: 100%; max-width: 320px` (작은 화면에서도 전체 폭 활용)

## Phase 30: Slack 리딩 알림 ✅
- `services/slackService.js` 신규 생성: Incoming Webhook 기반 리딩 성공 시 알림
- 알림 항목: 스프레드, 질문, 카드 목록(역방향 표시), 토큰(입력/출력), 비용($), 응답시간, 접속 IP, Accept-Language, 디바이스/브라우저, 환경(개발/프로덕션), 시각(KST)
- `services/claudeService.js`: `generateReading` 반환값 `string` → `{ reading, usage }` (토큰 정보 포함)
- `routes/reading.js`: 응답시간 측정 + 요청 메타데이터 슬랙 전달, 알림 실패 시 리딩 응답 영향 없음
- `.env`: `SLACK_WEBHOOK_URL` 추가

## Phase 29: 코드 정리 + Railway 배포 준비 ✅

### 29-1. Dead Code 및 중복 로직 제거
- `particles.js`: `createParticle(forceRandom)` — 양쪽 분기 동일한 dead parameter 제거
- `effects.js`: `startSelectedCardParticles` 내 `count=1; for loop` → `if` 직접 분기로 단순화
- `routes/reading.js`: `maxAge: 86400 * 1000` → 기존 `LIMIT_DURATION_MS` 상수 재사용
- `services/claudeService.js`: 에러 핸들러의 중복 timeout map 제거 → `timeout / 1000` 사용, `timeout`/`maxTokens`를 함수 스코프로 이동
- `app.js`: `spreadPositions` 객체 2회 중복(`proceedToCardReveal`, `displayReading`) → 모듈 상수 `SPREAD_POSITIONS`로 추출
- `app.js` + `animation.js`: 개발용 `console.log` 전체 제거 (에러/경고 유지)
- `cards.js`: 사용되지 않는 `selectRandomCards`, `selectCardsForSpread`, `getCardInfo` 함수 제거 → `shuffleArray`만 유지

### 29-2. Railway 배포 + 캐시 버스팅
- `server.js` 전면 개선:
  - 서버 시작 시 git 커밋 해시(`git rev-parse --short HEAD`) 기반 `BUILD_VERSION` 생성 (git 없으면 타임스탬프 폴백)
  - `index.html` 메모리 캐싱 + JS/CSS 참조에 `?v=BUILD_VERSION` 주입 (정규식: `/(\/(?:js|css)\/[^"?]+)"/g`)
  - `express.static` `index: false` + `setHeaders`: JS/CSS/이미지 `Cache-Control: public, max-age=31536000, immutable`
  - HTML 라우트(`/`, `/dev`, `/index.html`, SPA fallback): `Cache-Control: no-cache`
- `railway.toml` 신규 생성: NIXPACKS 빌더, `npm start`, 헬스체크 `/`, 재시작 정책
