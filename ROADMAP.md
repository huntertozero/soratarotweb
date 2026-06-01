# 타로 리딩 웹 앱 - 구현 로드맵

**마지막 업데이트**: 2026-06-01  
**현재 버전**: Phase 46 완료

> 상세 구현 이력(Phase 1~31) → **DONE.md**  
> 현재 개발 가이드 → **CLAUDE.md**  
> 화면 구성 명세 → **SCREENS.md**

---

## 완료된 마일스톤

### 기반 구축 (Phase 1~5) ✅
- Node.js/Express 서버, 78장 카드 데이터, Claude API 연동
- 기본 UI (화면 전환, 카드 셔플/선택/플립), 반응형 CSS

### UI/UX 고도화 (Phase 6~9) ✅
- 카드 직접 선택 그리드(78장), 카드 이미지 연동, 역방향 처리
- READING 3열 레이아웃 (좌카드 | 중해석 | 우카드), 높이 동기화

### AI 품질 향상 (Phase 10~14) ✅
- Claude 프롬프트 개선 (일반인 친화적, 이미지 해석 원칙 포함)
- `prompts/*.md` 파일 분리 (서버 재시작 없이 즉시 반영)
- 스프레드별 `max_tokens` / 타임아웃 분리 (one 30초, three 45초, celtic 90초)
- 켈틱 크로스 포지션 명칭 웨이트-스미스 전통으로 개정
- `imageSymbols` 필드 78장 전체 추가

### 운영 기능 (Phase 15~17) ✅
- 스프레드별 24시간 1회 제한 (httpOnly 쿠키, 쿠키 만료 버그 수정)
- `/dev` 개발 전용 진입점 (제한 없음)
- `/sync` 슬래시 커맨드로 세션 작업 자동 동기화

### 애니메이션 시스템 (Phase 18) ✅
- `particles.js`: Canvas 별 파티클 150개 + 오로라 blob 3개, 화면 전환 폭발 효과
- `effects.js`: 카드 플립 Flash, 오라클 구체 로딩 애니메이션 (Canvas 2D)

### 모바일 최적화 (Phase 19~26) ✅
- 반응형 카드 그리드: 768px→9열, 600px→7열, 480px→6열
- READING 모바일 1열 + 가로 스크롤, 켈틱 크로스 3+3+2+2 배치
- 켈틱 크로스 플립 순서 PC/모바일 분기, 카드 떨림 효과
- 모바일 버튼 핀(IntersectionObserver), 스프레드 선택 3D 스택 슬라이더

### 배포 & 품질 (Phase 27~32) ✅
- 카드 위치 랜덤화(매 진입마다), 켈틱 번호 뱃지
- Slack Incoming Webhook 리딩 알림 (토큰/비용/IP/디바이스 등)
- Railway 배포 (`railway.toml`), 캐시 버스팅 (git 해시 `?v=`)
- Dead code 제거, 디버그 로그 제거

### UX 세부 개선 (Phase 33~36) ✅
- 잠금 해제 시각 표시 ("오늘/내일 오전/오후 N시 N분부터 가능")
- 카드 줌 팝업: READING 화면 카드 클릭 시 중앙 확대, 키워드·REVERSE·위치 레이블 표시
- 스크린샷 안내 문구, 처음으로 버튼 가운데 정렬
- 버그 수정: 데스크탑 카드 선택 완료 시 하단 여백 늘어나는 문제

### 보안 강화 (Phase 38) ✅
- 취약점 분석 및 `SECURITY.md` 문서화 (9개 항목, 심각도별 분류)
- Rate Limiting: `express-rate-limit` — /api 분당 20회, /api/reading 시간당 15회
- IP 기반 24시간 제한: 쿠키 삭제 우회 차단 (`ipLimitStore` 인메모리)
- `/dev` 보호: `DEV_TOKEN` 환경변수 게이트 (불일치 시 404)
- Prompt Injection 방어: `sanitizeQuestion()` HTML 태그 및 제어 문자 제거
- XSS 방어: `DOMPurify` 추가, `renderMarkdown()` sanitize 적용
- CORS: `cors` 패키지, `ALLOWED_ORIGINS` 환경변수 기반 화이트리스트
- 보안 헤더: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- isReversed strict equality 타입 강제, NODE_ENV 미설정 경고

### 모바일 UX 개선 + 카드 한글명 (Phase 39) ✅
- READING 화면 카드 목록 가로 자동 스크롤 힌트 (8초 우→2초 대기→8초 좌, 터치 시 취소)
- marked.js + DOMPurify CDN → `public/js/vendor/` 로컬 번들 (CSP cdn.jsdelivr.net 제거)
- 카드 한글명 단일 소스화: `data/cards.js nameKo`, API `name`+`nameKo` 동시 응답
- 개발 중 캐시 버스팅 개선: dirty 변경 시 `{hash}-{timestamp}` 형식

### 버그 수정 (Phase 40) ✅
- SHUFFLE 화면 진입 시 스크롤 최상단 보정:
  - `history.scrollRestoration = 'manual'` — 브라우저 자동 스크롤 복원 비활성화
  - `createCardGrid()` 후 `requestAnimationFrame(() => scrollTo(0,0))` — DOM 추가 후 스크롤 재보정
  - 효과: `.shuffle-info`(상단 텍스트)와 `.cards-grid` 간헐적 겹침 해소

### UX 개선 (Phase 41~43) ✅
- 원 카드 선택 시 INPUT_QUESTION 화면 스킵, 바로 SHUFFLE 진입
- 웰컴 화면 면책 문구 추가, 원 카드 프롬프트 개선
- 모바일 텍스트 레이아웃 개선 (h2 폰트 축소, 줄바꿈 최적화, 24시간 제한 gold 강조)

### 클라리파이어 카드 — 1차 (Phase 44) ✅
- 리딩 완료 후 조건에 따라 보충 카드 1~2장 추가 선택 및 보충 해석 기능 (1차 구현)
- 4가지 활성화 조건: A/B(클라이언트), C(AI신호/서버), D(역방향과반수/서버)
- READING 화면 하단 인라인 클라리파이어 섹션

### 클라리파이어 카드 — 전면 재설계 (Phase 45) ✅
- 선택 시점 변경: 해석 후 → CARD_REVEAL 오라클 구체 실행 전
- 통합 해석: 단일 `/api/reading` 호출 (`clarifierCards` 파라미터), `POST /api/reading/clarifier` 삭제
- 조건 C(AI 신호) 삭제, 조건 D 클라이언트로 이동
- READING 화면 카드 목록에 클라리파이어 카드 포함 (맨 오른쪽, sky-400 `+` 뱃지)
- `prompts/one.md`, `three.md` 통합 해석 지시로 프롬프트 교체

### 코드 최적화 (Phase 46) ✅
- `claudeService.js`: 스프레드별 타임아웃·토큰 인라인 객체 → 파일 레벨 상수 분리
- `routes/reading.js`: 클라리파이어 카드 `cards.find()` 이중 조회 제거
- `app.js` `fetchReading()`: `loadingState` DOM 조회 단일화, `stopLoading()` 헬퍼 추출
- `app.js` `updateCardSelectionUI()`: `some()` O(n) → `Set.has()` O(1) 최적화

---

## 남은 작업

### 우선순위 높음
없음

### 우선순위 낮음 (선택적)

| 기능 | 설명 | 난이도 |
|------|------|--------|
| 프리셋 질문 버튼 | "내 미래는?" 등 추천 질문 버튼 | 낮음 |
| 리딩 히스토리 | localStorage에 결과 저장, 목록 조회 | 중간 |
| 다크/라이트 테마 | CSS 변수 기반 테마 전환 토글 | 중간 |
| 카드 플립 효과음 | Web Audio API 또는 mp3 파일 | 낮음 |
| 결과 공유 | 결과 텍스트 클립보드 복사 또는 URL 공유 | 중간 |

---

## 기술 스택 현황

| 영역 | 기술 |
|------|------|
| 런타임 | Node.js v24, Express |
| AI | Claude Sonnet 4.6 (`@anthropic-ai/sdk`) |
| 프론트엔드 | Vanilla JS + HTML/CSS (번들러 없음) |
| 마크다운 | marked.js v12 + DOMPurify v3 (로컬 번들, `public/js/vendor/`) |
| 배포 | Railway (NIXPACKS) |
| 모니터링 | Slack Incoming Webhook |
| 폰트 | Noto Serif KR (제목), Pretendard (본문) |
