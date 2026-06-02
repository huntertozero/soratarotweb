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

## Phase 31: 모바일 스프레드 선택 화면 카드 정렬 버그 수정 ✅
- **원인**: `.spread-card.locked { position: relative }` (specificity 0,2,0)가 `.spread-slide { position: absolute }` (0,1,0)를 덮어써서, 세 스프레드 모두 잠긴 상태에서 카드들이 absolute 포지셔닝을 잃고 그리드 일반 흐름으로 배치됨
- **수정**: `@media (max-width: 768px) { .spread-slider-track .spread-slide.locked { position: absolute; } }` 추가 — specificity 0,3,0으로 `.spread-card.locked` 이후에 위치하여 확실히 override
- 잠긴 카드 포함 모든 상태에서 스택 카드 3D 효과(translateX ±100px + rotateY ±28deg) 정상 동작

## Phase 38: 보안 강화 전체 ✅

### 38-1. 취약점 분석 및 문서화
- `SECURITY.md` 신규 생성: 9개 취약점 심각도별 분류 (Critical 2, High 2, Medium 3, Low 2)
- 각 항목별 위치(파일:라인), 재현 방법, 조치 내역 기록

### 38-2. Rate Limiting (Critical)
- `express-rate-limit` 패키지 추가
- `/api` 전체: IP당 **분당 20회** 제한 (자동화 스크립트 1차 차단)
- `/api/reading` 전용: IP당 **시간당 15회** 추가 제한 (쿠키 우회 시에도 API 호출 차단)
- `app.set('trust proxy', 1)`: Railway 프록시 뒤에서 실제 클라이언트 IP 정확 추출

### 38-3. IP 기반 24시간 제한 (Critical)
- `ipLimitStore` (`Map<ip, Map<spread, timestamp>>`): 서버사이드 인메모리 사용 기록
- 쿠키 삭제해도 IP 기록으로 제한 유지 (쿠키 + IP 이중 저장)
- `GET /api/limits`: 쿠키와 IP 중 더 큰 값(`Math.max`) 기준으로 통일
- `DELETE /api/limits`: 쿠키와 IP 스토어 동시 초기화

### 38-4. `/dev` 엔드포인트 보호 (High)
- `DEV_TOKEN` 환경변수 기반 게이트: `/dev?token=<DEV_TOKEN>` 인증 필요
- 불일치 시 `404 Not found` (엔드포인트 존재 자체 비노출)
- `DEV_TOKEN` 미설정 시 기존 동작 유지

### 38-5. Prompt Injection 방어 (High)
- `sanitizeQuestion()` 추가: HTML 태그 제거(`<[^>]*>`), C0 제어 문자 제거
- sanitize된 질문으로 길이 재검증 후 Claude에 전달

### 38-6. XSS 방어 (Medium)
- `DOMPurify` CDN 추가 (`cdn.jsdelivr.net/npm/dompurify@3`)
- `renderMarkdown()`: `marked.parse()` 결과를 `DOMPurify.sanitize()`로 정화 후 반환
- dev 모드 감지: 인라인 스크립트(`window.TAROT_APP_MODE`) → `<meta name="app-mode">` 태그로 교체 (CSP `script-src 'unsafe-inline'` 제거)
- `app.js`: `IS_DEV_MODE` 감지를 `document.querySelector('meta[name="app-mode"]')` 방식으로 변경

### 38-7. CORS (Medium)
- `cors` 패키지 추가, `/api` 라우트에 적용
- 프로덕션: `ALLOWED_ORIGINS` 환경변수로 허용 도메인 명시
- 개발: `localhost:3000`, `localhost:3001` 허용
- 미허용 오리진 → `403 Forbidden`

### 38-8. 보안 헤더 — CSP (Medium)
- `Content-Security-Policy`: script-src, style-src, font-src, img-src, connect-src, frame-ancestors, object-src 전체 정의
- `X-Content-Type-Options: nosniff` (MIME 스니핑 방지)
- `X-Frame-Options: DENY` (클릭재킹 방지)
- `Referrer-Policy: strict-origin-when-cross-origin`

### 38-9. isReversed 타입 강제 (Low)
- `rc.isReversed || false` → `rc.isReversed === true` strict equality

### 38-10. NODE_ENV 미설정 경고 (Low)
- 서버 시작 시 `NODE_ENV` 미설정이면 콘솔 경고 출력

## Phase 39: 모바일 UX 개선 + 카드 한글명 단일 소스화 ✅

### 39-1. 모바일 카드 목록 자동 스크롤 힌트
- `startCardListHintScroll()` 추가 (`app.js`): 해석 화면 진입 시 0.6초 후 실행
- 카드 목록(`.cards-summary-wrapper`)이 우측 끝까지 8초 천천히 스크롤 → 2초 대기 → 좌측으로 8초 복귀
- 스크롤 여백 ≤20px이면 실행 안 함 (1·3장 스프레드에서 불필요한 경우 방지)
- 터치/마우스 클릭 시 즉시 취소 (사용자 조작 우선)

### 39-2. 카드 목록 레이아웃 재구조
- `.card-summary-item` → `.card-summary-wrap` 래퍼로 감쌈 (flex column)
- 위치 레이블(`.csm-position-label`): 카드 내부 absolute → 카드 아래 일반 블록으로 이동
- 카드 클릭 이벤트: `.card-summary-item` → `.card-summary-wrap` 기준으로 변경 (레이블 영역도 클릭 가능)
- 모바일 가로 스크롤: `flex-shrink: 0; width: 80px/65px` 단위를 wrap에 적용

### 39-3. 카드 줌 팝업 개선
- 위치 레이블: 카드 이미지 오른쪽 상단(absolute) → 카드 아래 정보 영역으로 이동
- 텍스트 순서: 위치 레이블 → 카드명/REVERSE → 키워드
- 카드명 형식: `영문명 (한글명)` (예: `Nine of Cups (컵 9)`)

### 39-4. marked.js + DOMPurify 로컬 번들화
- CDN 의존 제거: `cdn.jsdelivr.net` → `public/js/vendor/` 로컬 파일 서빙
  - `npm install marked@12 dompurify@3 --save-dev` 후 minified 파일 복사
  - `public/js/vendor/marked.min.js`, `public/js/vendor/purify.min.js`
- `index.html` 스크립트 태그 로컬 경로로 변경
- CSP `script-src`에서 `https://cdn.jsdelivr.net` 제거 (self만 허용)
- 효과: CDN 실패 시 마크다운이 raw 텍스트로 표시되던 버그 완전 해결

### 39-5. 개발 중 캐시 버스팅 개선
- `server.js` `getBuildVersion()`: 미커밋 변경사항이 있으면 `{hash}-{timestamp}` 형식으로 BUILD_VERSION 생성
- 효과: 코드 수정 후 서버 재시작 시 브라우저가 항상 최신 JS/CSS 로딩

### 39-6. 카드 한글명 단일 소스화
- `data/cards.js` `nameKo` 78장 → 한글명 (지팡이/컵/칼/동전, 페이지/기사/여왕/왕 스킴)
- `public/js/cardMeta.js` 동일하게 한글 동기화
- `routes/reading.js`: API 응답에 `name`(영문) 필드 추가 (`{ id, name, nameKo, ... }`)
- `services/claudeService.js`: Claude 프롬프트 카드명 `nameKo` → `name (nameKo)` 형식
- `prompts/system.md`: 한글명은 프롬프트 값을 그대로 쓰도록 지시 + 예시 스킴 통일
- `app.js`: `CARD_NAMES_KO` 상수 제거 / 카드 목록=`card.name`(영문) / 줌팝업=`card.name (card.nameKo)`

## Phase 40: #screen-shuffle 진입 시 스크롤 최상단 보정 ✅

### 40-1. 브라우저 스크롤 복원 비활성화
- `DOMContentLoaded` 초기화 시 `history.scrollRestoration = 'manual'` 설정
- 모바일 브라우저(iOS Safari 등)의 자동 스크롤 복원이 `window.scrollTo(0, 0)`을 덮어쓰는 현상 차단

### 40-2. 카드 그리드 DOM 추가 후 스크롤 재보정
- `proceedToShuffle()`에서 `createCardGrid()` 직후 `requestAnimationFrame(() => window.scrollTo(0, 0))` 추가
- 78장 카드 DOM 추가 → 브라우저 레이아웃 재계산 → 다음 프레임에서 스크롤 확실히 최상단으로 고정
- 효과: 진입 시 `.shuffle-info`(상단 텍스트)와 `.cards-grid` 겹침 현상(간헐적) 해소

## Phase 41: 원 카드 선택 시 질문 입력 화면 스킵 ✅

### 41-1. 스프레드 선택 → 셔플 직행 (원 카드)
- `app.js` 스프레드 카드 클릭 핸들러: `spread === 'one'`이면 `appState.question = ''` 설정 후 `proceedToShuffle()` 직접 호출
- 기존: SELECT_SPREAD → INPUT_QUESTION → SHUFFLE
- 변경: SELECT_SPREAD → SHUFFLE (원 카드만)
- 3카드·켈틱 크로스는 기존대로 INPUT_QUESTION 경유

### 41-2. 셔플 뒤로가기 분기 처리
- `#btn-back-question` 클릭 시: `appState.selectedSpread === 'one'`이면 `select-spread`로 이동, 그 외는 기존대로 `input-question`으로 이동
- `selectedCards` 초기화는 공통 유지

## Phase 42: 웰컴 면책 문구 + 원 카드 프롬프트 개선 ✅

### 42-1. 웰컴 화면 면책 문구 추가
- `public/index.html`: `#btn-start-reading` 버튼 하단에 `.welcome-disclaimer` `<p>` 추가
  - 텍스트: "개인 정보를 수집 또는 이용하거나 / 별도의 비용을 요구하지 않습니다."
- `public/css/style.css`: `.welcome-disclaimer` 스타일 — `margin-top: 80px`, `font-size: 12px`, `font-style: italic`, `color: rgba(255,255,255,0.2)`, `text-align: center`

### 42-2. 원 카드 프롬프트 행동 항목 개선
- `prompts/one.md`: "오늘 하루 적용 방법" 항목을 행동 2가지 → 행동 1가지 + 피해야 할 것 1가지로 변경
- 추상적 예시 문구 제거, 실천 지침 구체화

### 42-3. 질문 입력 화면 버튼 텍스트 변경
- `public/index.html`: `#btn-next-question` 버튼 텍스트 "다음" → "카드 선택하기"

## Phase 43: 모바일 텍스트 레이아웃 개선 ✅

### 43-1. 모바일 h2 + #shuffle-message 폰트 축소 및 가운데 정렬
- `style.css` 768px 브레이크포인트: 36px → 32px (약 10% 감소), `text-align: center` 추가
- `style.css` 480px 브레이크포인트: 28px → 25px (약 10% 감소), `text-align: center` 추가
- 대상: `.spread-container h2`, `.question-container h2`, `#shuffle-message`

### 43-2. .question-hint 줄바꿈
- `public/index.html`: "현실적이고 구체적일수록 더 좋은 해석을 받을 수 있습니다" → "현실적이고 구체적일수록`<br>`더 좋은 해석을 받을 수 있습니다" (줄바꿈 추가)

### 43-3. shuffle 부가 설명 줄바꿈 + 정렬 + 간격 조정
- `public/index.html`: "카드들의 주파수를 느끼며 신중히 선택해주세요" → 줄바꿈 + `text-align: center` + `margin: 16px 0 8px`
- #shuffle-message↔부가설명, 부가설명↔#shuffle-count 간격을 h2↔.question-hint(16px) 기준으로 통일

### 43-4. .spread-subtitle 문구 개선
- `public/index.html`: "다음 3가지 옵션 중 / 하나를 골라 눌러주세요 / (각 옵션은 **24시간 제한**이 있어요)"
- "24시간 제한" 색상: `var(--color-gold)` (.spread-desc와 동일)

---

## Phase 44: 클라리파이어 카드 (Clarifier Card) 기능 구현 ✅

리딩 완료 후 조건에 따라 보충 카드 1~2장을 추가 선택해 보충 해석을 받는 기능.

### 44-1. 클라리파이어 활성화 조건 구현

| 조건 | 감지 위치 | 적용 스프레드 | 카드 수 |
|------|----------|-------------|---------|
| A. 선택/비교 키워드 | 클라이언트 (`app.js`) | 전체 | 2장 |
| B. 원 카드 역방향 | 클라이언트 | 원 카드만 | 1장 |
| C. AI 불확실성 신호 | 서버 (Claude 응답 파싱) | 원 카드·3카드 | 1장 |
| D. 역방향 과반수 (>50%) | 서버 | 3카드 (켈틱 제외) | 1장 |

- **조건 A**: `/둘\s*중|어느\s*쪽|[가-힣]+와\s*[가-힣]+\s*중|아니면|vs\.?|선택해야|갈아타야/i` 정규식
- **조건 C**: 프롬프트에 `<!--CLARIFIER:{"needed":true,"reason":"..."}-->` 지시 추가 (`prompts/one.md`, `prompts/three.md`), 서버에서 추출·제거 후 `clarifier` 필드로 분리
- 켈틱 크로스(10장)는 이미 충분하므로 조건 C·D 모두 비허용

### 44-2. 서버 변경사항 (`routes/reading.js`, `services/claudeService.js`)

- `POST /api/reading` 응답에 `clarifier: { needed, trigger, reason }` 필드 추가
  - `trigger` 값: `"ai_signal"` | `"reversed_majority"` | `null`
- `POST /api/reading/clarifier` 신규 엔드포인트
  - 입력: `{ originalCards, clarifierCards (1~2장), question, spread }`
  - 중복 카드 ID 방어 (원래 카드 포함 전체 집합 기준)
  - max_tokens: 800, timeout: 30초
- `services/claudeService.js`: `generateClarifierReading()` 함수 추가
- `prompts/clarifier.md`: 클라리파이어 전용 프롬프트 신규 생성

### 44-3. 클라이언트 변경사항 (`app.js`)

- `appState.clarifier` 하위 상태 추가 (`trigger`, `cardCount`, `reason`, `selectedCards`)
- `detectComparisonQuestion(question)` — 조건 A 정규식 감지
- `checkClarifierConditions(serverClarifier)` — 조건 A·B·서버 응답 종합 판단
- `showClarifierBanner(reason)` — READING 화면 하단 배너 표시
- `openClarifierShuffle()` — 보충 카드 선택 UI (기존 사용 카드 제외)
- `setupClarifierCardListeners()` — 클라리파이어 그리드 이벤트
- `fetchClarifierReading()` — `/api/reading/clarifier` 호출
- `renderClarifierResult(data)` — 보충 카드 이미지 + 해석 텍스트 렌더링
- `btn-home` 클릭 시 `appState.clarifier` 초기화 포함

### 44-4. UI (`index.html`, `style.css`)

- READING 화면(`.reading-content-wrapper`) 내 클라리파이어 섹션 인라인 추가:
  - `#clarifier-section`: 전체 섹션 (초기 `display:none`, 조건 충족 시 표시)
  - `#clarifier-banner`: "✦ 카드가 추가 메시지를 전하고 있어요" + 이유 텍스트 + "추가 카드 뽑기" 버튼
  - `#clarifier-shuffle-area`: 보충 카드 그리드 (기존 `.card-back-item` 재활용)
  - `#clarifier-reading-area`: 로딩 dots + 카드 이미지 + 보충 해석 텍스트
- `style.css`: 클라리파이어 전용 스타일 186줄 추가 (dotBounce 애니메이션 포함)

---

## Phase 45: 클라리파이어 카드 전면 재설계 — 통합 해석 방식 ✅

### 핵심 변경사항

| 항목 | 변경 전 (Phase 44) | 변경 후 (Phase 45) |
|------|-----------------|-----------------|
| 선택 시점 | 해석 완료 후 배너 | CARD_REVEAL 오라클 구체 실행 전 |
| 해석 방식 | 별도 보충 해석 (2회 API 호출) | 단일 통합 해석 (1회 API 호출) |
| 조건 C | AI 신호 (`<!--CLARIFIER:-->`) | **삭제** (해석 전 감지 불가) |
| 조건 D | 서버 계산 | 클라이언트로 이동 |
| API | `POST /api/reading/clarifier` 별도 존재 | **삭제**, `/api/reading`에 통합 |

### 45-1. 서버 변경 (`routes/reading.js`, `services/claudeService.js`)
- `POST /api/reading` 요청 body에 `clarifierCards` 파라미터 추가 (선택사항, 최대 2장)
- 켈틱 크로스 clarifierCards 강제 무시, 중복 카드 ID 방어
- `generateReading()` 시그니처 변경: `clarifierCards = []` 파라미터 추가
- `formatClarifierCardsForPrompt()` 함수 추가: 프롬프트 내 `**✦ 추가 카드**` 섹션 생성
- 클라리파이어 카드 있으면 max_tokens `+600` (최대 4096)
- 응답 구조: `{ reading, cards, clarifierCards }` (`clarifier` 필드 제거)
- `POST /api/reading/clarifier` 엔드포인트 삭제, `generateClarifierReading()` 삭제

### 45-2. 프롬프트 변경
- `prompts/one.md`, `prompts/three.md`: `<!--CLARIFIER:-->` 지시 삭제 → `### 추가 카드가 포함된 경우` 섹션으로 교체
  - 프롬프트에 "✦ 추가 카드" 섹션 있을 때만: 해석 마지막에 카드별 별도 섹션 추가
  - 제목 형식: `**✦ 추가 카드: 영문명 (한글명)**`
- `prompts/clarifier.md`: 별도 프롬프트 역할 폐기 → 통합 해석 지침 참고 문서로 재작성

### 45-3. 클라이언트 변경 (`app.js`)
- `proceedToCardReveal()` 수정: 카드 플립 완료 후 `checkClarifierConditions()` 호출, 조건 충족 시 `openClarifierPreSelection()`, 아니면 즉시 `startOracleAndFetch()`
- `startOracleAndFetch()` 분리: 로딩 + 오라클 + fetchReading 묶음
- `fetchReading()`: 요청 body에 `clarifierCards: appState.clarifier.selectedCards` 추가
- `displayReading()`: `data.clarifierCards` 포함 시 카드 목록 맨 오른쪽에 렌더링, `isClarifier` 플래그 → `.clarifier-badge` 렌더
- `checkClarifierConditions()`: 조건 A/B/D 클라이언트 전용으로 재작성 (서버 응답 불필요)
- `openClarifierPreSelection()`, `setupClarifierPreGridListeners()` 신규 함수
- 구 함수 삭제: `showClarifierBanner()`, `openClarifierShuffle()`, `setupClarifierCardListeners()`, `fetchClarifierReading()`, `renderClarifierResult()`

### 45-4. UI 변경 (`index.html`, `style.css`)
- `#screen-reading` 내 `#clarifier-section` 전체 삭제
- `#screen-card-reveal` 내 `#loading-state` 앞에 `#clarifier-before-reading` 추가
  - 제목 "✦ 추가 카드를 뽑아볼까요?", 이유 텍스트, 카운터, 카드 그리드, "추가 카드 선택 완료" 버튼
  - 건너뛰기 버튼 없음 (추가 카드는 반드시 선택 후 진행)
  - 이유 텍스트: 문장 단위 `<br>` 줄바꿈
- `.clarifier-badge`: sky-400(`#38bdf8`) 색상, 우측 상단 돌출 화살표 (`.card-number-badge` 미러)
- 구 `.clarifier-banner*`, `.clarifier-loading*`, `.clarifier-result*` 등 스타일 삭제

---

## Phase 46: 코드 최적화 ✅

### 46-1. `services/claudeService.js`
- 스프레드별 타임아웃·토큰 인라인 객체 → 파일 레벨 상수 `SPREAD_TIMEOUTS` / `SPREAD_BASE_TOKENS` 분리
  - 매 `generateReading()` 호출마다 임시 객체 생성 제거, 가독성 향상

### 46-2. `routes/reading.js`
- 클라리파이어 카드 `cards.find()` 이중 조회 제거
  - `requestedClarifierCards` 생성 시 `cardData` 포함 → `responseClarifierCards` 생성 시 재조회 불필요

### 46-3. `public/js/app.js`
- `fetchReading()`: `loadingState` DOM 조회를 함수 최상단 1회로 통합
  - try 블록 내부, if(429) 블록, catch 블록에 중복 선언(shadowing 포함)되던 것을 제거
  - `stopLoading()` 내부 헬퍼 추출 — 중복 `classList.remove + stopOracleAnimation` 3곳 통합
- `updateCardSelectionUI()`: 78장 카드 순회 시 `some()` O(n) 탐색 → `Set.has()` O(1) 로 최적화
  - 매 UI 갱신마다 `selectedCards` 배열을 Set으로 미리 변환 후 O(1) 조회

---

## Phase 47: 클라리파이어 UI 세부 개선 ✅

### 47-1. 제목에 카드 장수 동적 표시 (`index.html`, `app.js`)
- `.clarifier-pre-title` → `#clarifier-pre-title`로 id 추가
- 정적 문자열 "✦ 추가 카드를 뽑아볼까요?" → `openClarifierPreSelection()` 진입 시 `cardCount` 반영하여 "✦ 추가 카드 N장을 뽑아볼까요?" 동적 설정

### 47-2. 카드 선택 카운터 제거 (`index.html`, `app.js`, `style.css`)
- `#clarifier-pre-count / #clarifier-pre-required` 스팬과 `.clarifier-pre-count-info` 단락 삭제
- `openClarifierPreSelection()` / `setupClarifierPreGridListeners()`에서 `pickCount`, `pickRequired` 변수 및 참조 제거

### 47-3. 이유 텍스트 문구·정렬 개선 (`app.js`, `style.css`)
- 세 조건 reason 문자열 수정 (줄바꿈 위치 조정, "많아요 → 많네요" 어조 변경):
  - `comparison`: "선택지가 있는 질문에는,\n각 방향을 보여주는 카드가 도움이 돼요"
  - `one_reversed`: "막혀있는 에너지를 뚫어줄\n돌파구 카드가 있을 것 같아요"
  - `reversed_majority`: "막혀있는 에너지가 많네요\n흐름을 도와줄 카드가 있을 것 같아요"
- 렌더링 로직: 구두점 기반 `<br>` 변환 → `\n → <br>` 단순 변환으로 교체
- `.clarifier-pre-reason`에 `text-align: center` 추가
