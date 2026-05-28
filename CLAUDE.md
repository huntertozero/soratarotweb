# 타로 리딩 웹 애플리케이션 - 개발 가이드

## 프로젝트 개요

로컬 환경에서 혼자 사용하는 AI 기반 타로 리딩 웹 애플리케이션입니다.

- **사용자**: 질문을 입력 → 78장 카드 중 무작위 선택 → Claude AI가 한국어로 개인화된 해석 제공
- **기술 스택**: Node.js/Express (백엔드) + HTML/CSS/JS (프론트엔드, 번들러 없음)
- **AI 모델**: Anthropic Claude Sonnet 4.6
- **실행**: `npm start` 또는 `node server.js`

---

## 개발 규칙

### 1. 언어 및 문서화

- **코드 주석**: 한국어 (WHY가 명확하지 않은 경우만 작성)
- **커밋 메시지**: 한국어
- **UI 텍스트**: 모두 한국어
- **변수/함수명**: 영어 (코드 표준)
- **파일명**: 영어 (낙타 표기법 또는 대시 표기법)

### 2. 폴더 구조 준수

```
tarot-app/
├── server.js              # Express 진입점
├── data/                  # 카드 데이터
├── routes/                # API 라우터
├── services/              # 비즈니스 로직 (Claude 호출 등)
└── public/                # 정적 파일
    ├── index.html
    ├── css/
    ├── js/
    └── img/cards/         # 이미지는 여기만 (나중에 추가)
```

### 3. 핵심 설계 원칙

- **API 키 보안**: `.env` 파일에만 저장, 절대 프론트엔드 노출 금지
- **카드 데이터 분리**: 
  - 서버: `data/cards.js`에 78장 전체 데이터 (id, 이름, 의미, 키워드 등)
  - 클라이언트: `public/js/cardMeta.js`에 경량 메타만 (id, 이름, imageFile)
- **상태 관리**: 프론트엔드는 순수 JavaScript로 (`display` 토글, 최소 DOM 조작)
- **이미지 폴백**: `onerror` 패턴으로 이미지 없어도 CSS 버전으로 자동 대체

### 4. 커밋 패턴

각 파일/기능 완성 후 바로 커밋 (배치 커밋 금지)

```
git add <specific-file>
git commit -m "기능/파일 한국어 설명"
```

예:
```
git commit -m "data/cards.js - 메이저 아르카나 22장 완성"
git commit -m "services/claudeService.js - Claude API 호출 래핑 완성"
git commit -m "public/js/app.js - 화면 전환 로직 완성"
```

### 5. 엣지 케이스 우선순위

구현 순서: 정상 플로우 → 엣지 케이스 처리

주요 엣지 케이스:
- API 키 미설정 → 서버 시작 시 명확한 오류 메시지
- Claude 타임아웃 (30초) → 클라이언트에 재시도 안내
- 중복 카드 ID → 서버사이드 검증 (`Set` 사용)
- 질문 XSS → 프롬프트 삽입 전 특수문자 이스케이프

---

## 구현 단계

### Phase 1: 기반 구조 ✅ 완료
- [x] npm install (3개 의존성)
- [x] `.env` 파일 생성
- [x] `.gitignore` 생성
- [x] `server.js` 기본 구조
- [x] `public/index.html` 최소 마크업

### Phase 2: 카드 데이터 ✅ 완료
- [x] `data/cards.js` - 메이저 아르카나 22장
- [x] `data/cards.js` - 마이너 아르카나 56장
- [x] `public/js/cardMeta.js` - 경량 메타데이터

### Phase 3: 백엔드 API ✅ 완료
- [x] `services/claudeService.js` - Claude 호출
- [x] `routes/reading.js` - 검증 + 라우팅
- [x] `server.js`에 라우터 연결
- [x] API 단독 테스트 (curl/PowerShell)

### Phase 4: 프론트엔드 UI ✅ 완료
- [x] `public/css/style.css` - 레이아웃 + 테마
- [x] `public/index.html` - 화면 상태 마크업
- [x] `public/js/app.js` - 화면 전환 로직
- [x] `public/js/cards.js` - 셔플 + 카드 선택

### Phase 5: 애니메이션 + 통합 ✅ 완료
- [x] `public/js/animation.js` - 카드 플립
- [x] `public/js/app.js` - API 연동 + 마크다운 렌더링
- [x] 3가지 스프레드 전체 흐름 테스트
- [x] 반응형 CSS + 엣지 케이스 확인

### Phase 6: UI/UX 개선 ✅ 완료
- [x] 스프레드 카드 문구 개선 (원 카드, 쓰리 카드, 켈틱 크로스)
- [x] 스프레드 설명 텍스트 줄바꿈 추가
- [x] 스프레드 아이콘 크기 통일 (삼각형 축소)
- [x] SHUFFLE 화면 버튼 위치 고정 (스크롤 시에도 중앙 유지)
- [x] SHUFFLE 화면에 돌아가기 버튼 추가
- [x] 78장 카드 뒷면 그리드 표시 (13×6 레이아웃)
- [x] 사용자 직접 카드 선택 기능 구현
- [x] 카드 선택 애니메이션 (폭발 효과 + 지속적 glow)
- [x] CARD_REVEAL 화면 카드 비율 조정 (2.5:4 - 실제 타로 비율)
- [x] 역방향 카드 표현 (180도 회전)
- [x] 역방향 텍스트 색상 변경 (파란색 #64b5f6)
- [x] 스프레드별 레이아웃 (1장, 3장, 10장 5×2)
- [x] 모든 카드 크기 통일

### Phase 7: 카드 이미지 및 애니메이션 완성 ✅ 완료
- [x] 78장 카드 이미지 추가 (`public/img/cards/`)
- [x] 카드 플립 애니메이션: 하이라이트 스캔 효과 (위→아래, 0.5초)
- [x] 카드 이름 영문 국제화 (영문 + 로마자 숫자)
- [x] Reverse 카드 이미지 상하반전 처리
- [x] Reverse 카드: 이미지만 반전, 텍스트는 정상 방향
- [x] 3장 옵션: 카드 의미 텍스트 (과거/현재/미래) 플립 후 계속 표시
- [x] 10장 옵션: 카드 의미 텍스트 (Celtic Cross 위치) 플립 후 계속 표시
- [x] 카드 의미 텍스트: 카드 상단 가운데 정렬
- [x] 카드 의미 텍스트: 카드 이름과 동일한 색상/효과 (12px, 텍스트 그림자)

### Phase 8: 해석 결과 화면 최적화 ✅ 완료
- [x] 카드 뒷면 별 아이콘 완벽한 중앙 정렬
- [x] Reverse 카드 별 아이콘 회전 보정
- [x] READING 화면 3열 레이아웃 구성 (좌측 카드 | 중앙 해석 | 우측 카드)
- [x] 좌우 카드 컬럼 position: fixed로 고정 (스크롤 상관없이)
- [x] 카드와 해석 영역 간격 정확히 15px 유지
- [x] 페이지 초기 로드 시 카드 위치 즉시 정확하게 표시
- [x] READING 화면 카드에 이미지 표시 (CARD_REVEAL과 동일)
- [x] 이미지 위에 어두운 오버레이 (rgba 0.4) 추가
- [x] Reverse 카드 이미지 상하반전 (이미지만, 텍스트는 정상)
- [x] 카드 의미 텍스트 상단 중앙에 표시
- [x] 좌우 카드 높이를 해석 영역 높이와 동기화
- [x] 백엔드에서 카드 의미(meaning) 필드 응답에 추가

### Phase 9: READING 화면 카드 버그 수정 및 개선 ✅ 완료
- [x] `data/cardImages.js` 신규 생성: 78장 카드 ID → 이미지 파일명 매핑
  - data/cards.js에 imageFile 필드가 없어 이미지 URL이 `/img/cards/undefined`로 로딩 실패하던 근본 원인 해결
- [x] `routes/reading.js`: cardImages 모듈로 imageFile 필드 정상 응답
- [x] READING 화면 카드 이미지 정상 표시 (배경 이미지 + 반투명 오버레이)
- [x] Reverse 카드 이미지 scaleY(-1) 상하반전 처리
- [x] 카드 상단 위치 레이블 추가 (과거/현재/미래, 켈틱 크로스 10위치)
  - 색상: `var(--color-starlight)` (카드 이름과 동일)
  - 크기: 11px (REVERSE 텍스트와 동일)
- [x] 높이 동기화 타이밍 버그 수정
  - 기존: showScreen() 전에 getBoundingClientRect() 호출 → display:none 상태라 모든 좌표 0 반환
  - 수정: showScreen() 먼저 호출 후 requestAnimationFrame으로 위치·높이 계산
- [x] CSS 카드 클래스 재정의 (csm-* 네이밍)
  - `csm-bg-image` (z-index:0) / `csm-overlay` (z-index:1) / `csm-position-label` (z-index:2) / `csm-card-info` (z-index:2)
  - `isolation: isolate`로 스태킹 컨텍스트 격리
  - 스크롤바 숨김 처리 (overflow: auto는 유지)

### Phase 10: Claude 프롬프트 개선 (일반인 친화적 해석) ✅ 완료
- [x] `SYSTEM_PROMPT` 재구성: 따뜻한 타로 상담사 페르소나
  - 공통 역할: 친한 친구처럼 대화, 실질적 인사이트 집중
  - 공통 규칙: 전문 용어 금지, 질문 연결 해석
- [x] `one` 스프레드 instruction 재구성 (4단계 구조)
  - 오늘의 카드 한 줄 요약 → 나온 이유 → 오늘 하루 적용 방법 → 오늘의 한마디
  - 최대 500자, '오늘'/'지금'에 집중
- [x] `three` 스프레드 instruction 재구성 (4단계 구조)
  - 과거 해석 → 현재 해석 → 미래 해석 → 전체 흐름 요약
  - 최대 1000자, "~될 것입니다" 단정 표현 금지
- [x] `celtic` 스프레드 instruction 초기 재구성 (4단계 구조)
  - 전체 판 한 줄 요약 → 포지션별 해석(1~10번) → 핵심 3개 집중분석 → 스토리 요약
  - 최대 1500자, 부정 카드 공포감 없이 대처법 포함
- [x] `max_tokens` 1024 → 2000 (켈틱 크로스 1500자 + 여유분)
- [x] `userPrompt` 중복 해석 요청문 제거 (구조가 instruction에 통합됨)

### Phase 11: 버그 수정 및 켈틱 크로스 프롬프트 고도화 ✅ 완료
- [x] 에러 모달 버그 수정 (`index.html`)
  - `style="display: none;"` 인라인 스타일 제거
  - 원인: 인라인 스타일이 CSS `.modal.active { display: flex }`보다 우선순위가 높아 에러 발생 시 모달이 표시되지 않던 문제
- [x] `fetchReading()` 방어 코드 강화 (`app.js`)
  - 응답 `cards` 배열 존재 여부 검증 추가
- [x] `displayReading()` 디버깅 강화 (`app.js`)
  - 단계별 `console.log` 및 카드·텍스트 렌더링 `try-catch` 추가
- [x] 켈틱 크로스 포지션 명칭 전면 개정 (웨이트-스미스 전통 반영)
  - `claudeService.js` positions 배열 및 instruction 동시 업데이트
  - `app.js` 카드 리빌·해석 화면 포지션 레이블도 동일하게 통일
  - 변경 내역:

    | 번호 | 이전 | 이후 |
    |------|------|------|
    | 2번 | 장애물 | 가로막는 것 (양면성 설명) |
    | 3번 | 근본 원인 | 의식적 목표 |
    | 4번 | 가까운 과거 | 무의식적 기반 |
    | 5번 | 가능성 | 먼 과거 |
    | 7번 | 내 태도 | 나의 태도 |
    | 8번 | 외부 환경 | 외부 영향 |
    | 9번 | 희망 또는 두려움 | 희망과 두려움 |

- [x] 켈틱 크로스 instruction 고도화
  - 전체 판 요약: 1문장 → 최대 3문장
  - 포지션별 해석: "10장 모두 빠짐없이" 명시
  - 전체 스토리 요약: 1·2·4·9·10번 중심 서사 구조 명시, 8~10문장으로 확장

### Phase 13: 마크다운 렌더러 교체 + 프롬프트 고도화 ✅ 완료
- [x] 마크다운 렌더러 교체 (`public/js/app.js`, `public/index.html`, `public/css/style.css`)
  - 원인: 직접 만든 정규식 기반 `simpleMarkdownToHtml`이 들여쓰기·번호 매기기·중첩 리스트를 잘못 처리
  - `marked.js` CDN(v12) 도입 → `renderMarkdown()` 함수로 교체
  - `breaks: true` 옵션으로 단일 줄바꿈도 `<br>` 처리
  - CSS 보강: 중첩 리스트, `em`, `hr`, 첫 번째 제목 위 여백 제거 등
- [x] 프롬프트 파일 분리 (`prompts/*.md`, `services/claudeService.js`)
  - 기존 JS 하드코딩 → `prompts/system.md`, `one.md`, `three.md`, `celtic.md` 4개 파일로 분리
  - 서버 재시작 없이 파일 저장만으로 프롬프트 즉시 반영
- [x] `system.md` 고도화 (공통 카드 해석 원칙 추가)
  - **이미지 해석 원칙**: 카드 이미지의 인물·배경·상징물 1~2가지를 해석 근거로 자연스럽게 언급
  - **정방향/역방향 해석 원칙**: 정방향=에너지 활성화, 역방향=내부로 향하거나 막힘. 단어 직접 언급 금지, 의미로 풀어서 표현
  - **카드 간 연관성 원칙**: 원소·숫자 패턴, 상반 에너지, 흐름 방향을 반드시 언급
- [x] `one.md` 고도화 (5단계 구조로 개편)
  - 2단계 신설: "이 카드가 보내는 신호" — 이미지 1문장 + 정방향/역방향 방향 해석
  - 최대 글자 수 500자 → 600자로 확대
- [x] `three.md` 고도화 (5단계 구조로 전면 재편)
  - 1단계 신설: "3장의 첫인상" — 전체 분위기 1~2문장, 시각적 요소 근거
  - 각 카드 해석에 이미지 근거 + 정방향/역방향 방향 명시
  - 5단계 "3장의 이야기 연결": 에너지 흐름·숫자/원소 패턴·인물 시선 중 해당 항목 반드시 언급
  - 최대 글자 수 1000자 → 1200자로 확대
- [x] `celtic.md` 고도화 (이미지·방향 원칙 섹션 추가)
  - "카드 해석 시 반드시 지킬 원칙" 섹션 신설: 이미지 근거 예시 포함, 역방향 해석 형식 명시
  - 전체 판 요약에 원소·숫자·인물 방향 시각 패턴 언급 추가
  - 전체 스토리 요약에 카드 간 연관성 패턴(원소/숫자 반복, 1번↔10번 관계, 충돌 조합) 명시
  - 최대 글자 수 1500자 → 2000자로 확대

### Phase 14: 카드 데이터 최적화 ✅ 완료
- [x] `data/cards.js` 정리: 미사용 `description` 필드 제거
  - 원인: 메이저 아르카나 22장에만 있었던 미사용 필드, 코드 어디서도 참조하지 않음
  - 클린업: 22장 모두 삭제
- [x] `data/cards.js` 확장: 78장 모두 `imageSymbols` 필드 추가
  - 메이저 아르카나 22장: 웨이트-스미스 덱 핵심 상징물 기술
  - 마이너 아르카나 56장: 시각적 특징 및 카드 이미지 요소 추가
  - 용도: Claude AI가 이미지 기반 해석을 할 수 있도록 `formatCardsForPrompt()`에서 프롬프트 생성 시 활용

### Phase 12: 10장 토큰 한도 확장 + 해석 화면 UX 개선 ✅ 완료
- [x] 10장 스프레드 응답 잘림 버그 수정 (`claudeService.js`)
  - 원인: `max_tokens: 2000` 고정으로 켈틱 크로스 응답(~2000자) 초과 시 잘림
  - `max_tokens` 스프레드별 분리: `one` 1024 / `three` 1500 / `celtic` 4000
- [x] 10장 스프레드 타임아웃 버그 수정 (`claudeService.js`)
  - 원인: 30초 타임아웃 고정 → 켈틱 크로스 응답 생성에 35초+ 소요로 AbortError
  - 스프레드별 타임아웃 분리: `one` 30초 / `three` 45초 / `celtic` 90초
  - 타임아웃 에러 메시지에 스프레드별 초 단위 표시
- [x] 스프레드별 로딩 메시지 차별화 (`app.js`)
  - `one`: 최대 30초 정도 걸려요
  - `three`: 최대 45초 정도 걸려요
  - `celtic`: 최대 1분 정도 걸려요
- [x] 해석 화면 상단 질문 표시 기능 추가
  - `index.html`: `#reading-question` 영역 추가
  - `app.js`: `displayReading()`에 질문 렌더링 로직 추가 (질문 없으면 자동 숨김)
  - `style.css`: `.reading-question` 파란 테두리 박스 스타일 추가

### Phase 15: 24시간 사용 제한 + Railway 배포 준비 ✅ 완료
- [x] 스프레드별 24시간 1회 사용 제한 구현 (Railway 다중 사용자 대응)
  - `cookie-parser` 패키지 추가
  - `server.js`: cookieParser 미들웨어 등록, `/dev` 개발용 진입점 추가
    - `/dev` 접속 시 `index.html`에 `window.TAROT_APP_MODE = "dev"` 플래그 주입
  - `routes/reading.js`: 24시간 제한 헬퍼 함수 추가
    - `GET /api/limits`: 스프레드별 잠금 상태 반환
    - `DELETE /api/limits`: 모든 제한 쿠키 초기화 (개발 전용, 프로덕션에서 403)
    - `POST /api/reading`: spread 검증 후 쿠키 체크 → 제한 중이면 429 + remainingMs 반환
    - 성공 시 `tarot_limit_{spread}` httpOnly 쿠키 발급 (maxAge: 86400초)
  - `app.js`: 제한 UI 로직 추가
    - `IS_DEV_MODE`: `window.TAROT_APP_MODE === 'dev'` 감지 → 제한 UI 전체 스킵
    - `fetchSpreadLimits()`: `GET /api/limits` 조회 → `renderSpreadLimitUI()` 호출
    - `renderSpreadLimitUI()`: 잠금 카드에 `.locked` + `.spread-countdown` 카운트다운 삽입
    - 만료 감지 시 서버 재조회, 잠긴 카드 없으면 `clearInterval`로 메모리 누수 방지
    - `fetchReading()`: 429 응답 처리 + `X-Tarot-Dev: 1` 헤더 (개발 모드)
  - `style.css`: `.spread-card.locked` 잠금 스타일 추가
    - `::after` 반투명 오버레이로 카드 내용 어둡게 처리
    - `.spread-countdown` `z-index: 2`로 오버레이 위에 선명하게 표시
- [x] 개발/유저 진입점 분리
  - `http://localhost:3000/dev` → 개발 전용 (제한 없음, 서버도 우회)
  - `http://localhost:3000/` → 유저용 / Railway 배포 (제한 적용)
  - Railway 보안: `IS_PRODUCTION=true`이면 `X-Tarot-Dev` 헤더 무시
- [x] 원 카드 카드리빌 화면 위치 레이블 제거
  - `app.js` `proceedToCardReveal()`: `one` 스프레드에서 `positions = null` 전달
  - 쓰리 카드·켈틱 크로스의 위치 레이블은 그대로 유지

### Phase 16: 24시간 제한 쿠키 만료 버그 수정 ✅ 완료
- [x] `routes/reading.js` 쿠키 `maxAge` 단위 오류 수정
  - 원인: Express `res.cookie()`의 `maxAge`는 **밀리초** 단위인데 `86400`(초)으로 설정 → 실제 만료 86.4초
  - 증상: 해석 완료 후 약 86초가 지나면 쿠키 자동 만료 → '처음으로' 버튼 후 잠금이 풀린 것처럼 보임
  - 수정: `maxAge: 86400` → `maxAge: 86400 * 1000` (86,400,000ms = 24시간)

### Phase 17: 개발 편의 — `/sync` 커스텀 슬래시 커맨드 추가 ✅ 완료
- [x] `.claude/commands/sync.md` 생성
  - 기능: 세션 작업 내용을 CLAUDE.md에 새 Phase로 기록 후 `git push`까지 자동화
  - 사용법: 프롬프트에 `/sync` 입력
  - 참고: `.gitignore`로 인해 로컬 전용 (깃허브에는 추적되지 않음)

### Phase 19: 모바일 최적화 — 반응형 레이아웃 전면 개선 ✅ 완료
- [x] SHUFFLE 화면 카드 그리드 반응형 전환
  - `style.css`: `repeat(13, 1fr)` 고정 → breakpoint별 열 수 조정
    - `@media (max-width: 768px)`: 9열, gap 5px
    - `@media (max-width: 600px)` 신규: 7열, gap 4px
    - `@media (max-width: 480px)`: 6열, gap 4px
  - `.card-back-item::before` 아이콘 크기 단계적 축소 (40px → 24px → 18px)
  - `.card-back-item`, `.btn`: `touch-action: manipulation` 추가 (더블탭 줌 방지)
  - `.btn`: `min-height: 48px` (터치 타겟 최소 기준 보장)
- [x] READING 화면 모바일 레이아웃 전환
  - `style.css` 768px 이하: `grid-template-columns: 1fr` (3열 → 1열 세로 스택)
  - `.cards-summary-left`, `.cards-summary-right`: `position: static` + 가로 스크롤 바
    - `flex-direction: row`, `overflow-x: auto`, 카드 아이템 `flex-shrink: 0`
    - 768px: 카드 너비 80px / 480px: 65px
  - `app.js`: `syncLayout()` 내 `window.innerWidth <= 768` 분기 추가
    - 모바일에서 JS 인라인 스타일 초기화 후 CSS 미디어쿼리에 위임
  - `app.js`: `_syncLayoutHandler` 모듈 레벨 변수로 scroll/resize 리스너 누적 메모리 누수 수정
    - `displayReading()` 재호출 시 기존 리스너 제거 후 재등록
- [x] CARD_REVEAL 화면: `.card-item` 고정 `width: 200px` → `max-width: 200px`
  - 768px 이하에서 그리드 셀 크기에 맞게 유연하게 조정
  - `#cards-display.spread-celtic/three/one`에 `width: 100%` 추가
- [x] `body`: 768px 이하 `align-items: flex-start` (센터링 해제, 스크롤 허용)
- [x] READING 화면 `reading-container` 패딩 축소 (768px: 20px 15px)

### Phase 22: 웰컴 화면 초기 렌더링 일관성 및 반응형 개선 ✅ 완료
- [x] 웰컴 화면 Critical CSS 인라인 처리
  - 원인: IP 모바일 접속 시 외부 CSS 로드 지연으로 초기 렌더링이 일정하지 않음
  - 수정: `public/index.html` `<head>` 내 `<style>` 태그에 웰컰 화면의 핵심 CSS 직접 인라인
    - 색상 변수, 기본 레이아웃, deck-icon, 제목/부제목/설명 텍스트 스타일 포함
    - Pretendard CDN에 `rel="preconnect"` 추가 (연결 사전 설정)
    - Google Fonts `display=swap` 유지 (FOUT 방지)
  - 결과: 외부 CSS 로드 전에도 웰컴 화면이 정확하게 렌더링됨
- [x] 모바일 반응형 사이즈 조정 (`public/index.html` inline CSS)
  - 768px 이하 (태블릿/모바일):
    - 제목: 48px → 32px
    - 부제목: 24px → 18px
    - 설명: 16px → 14px
    - 카드 아이콘: 120×160 → 80×107
    - 여백: 60px 패딩 → 40px
  - 480px 이하 (소형 모바일):
    - 제목: 32px → 28px
    - 부제목: 18px → 16px
    - 설명: 14px → 13px
    - 카드 아이콘: 80×107 → 72×96
    - 카드 테두리: 2px → 1.5px
- [x] 버튼 스타일 복원 (`public/index.html`)
  - 원인: 인라인 CSS의 `.btn` 스타일이 모든 버튼에 적용되어 `.btn-secondary` 스타일 덮어씌움
  - 수정: 인라인 CSS에서 버튼 스타일 완전 제거
  - 결과: 외부 CSS의 `.btn-primary` (주황색 그라디언트) / `.btn-secondary` (투명 배경) 스타일이 정상 적용

### Phase 23: 모바일 UI/UX 세부 개선 및 카드 떨림 효과 구현 ✅ 완료
- [x] 모바일 카드 선택 화면 버튼 고정 개선
  - 필요한 카드를 모두 선택했을 때 스크롤과 무관하게 버튼 계속 고정 (`app.js`, `style.css`)
  - `_lastCardIntersecting` 변수로 마지막 카드 가시성 상태 추적
  - `updateShuffleButtonPin()` 함수로 선택 완료 여부 + 마지막 카드 가시성 동시 확인
- [x] 모든 화면의 제목 폰트 및 크기 통일 (`style.css`, `index.html`)
  - Serif 계열(`Noto Serif KR`) 통일
  - 크기: 데스크탑 48px, 768px 이하 36px, 480px 이하 28px으로 통일
  - 모든 제목에 `!important` 적용으로 우선순위 강제 지정
- [x] 스프레드 선택 화면 텍스트 수정 및 색상 처리
  - "어떤 방식으로 리딩을 받으시겠습니까?" → "어떤 리딩을 원하십니까?" 수정
  - "각 옵션은 24시간마다 1회 가능" → "각 옵션은 24시간마다 한 번씩 가능" 수정
  - "24시간마다 한 번씩" 부분만 주황색으로 표시
- [x] 질문 입력 화면 텍스트 수정 및 색상 통일
  - "카드에게 묻고 싶은 질문을 입력하세요" → "어떤 것이 궁금하세요?" 수정
  - 보조 설명 텍스트 색상 흰색(`--color-silver`) → 제목 색상(`--color-starlight`)으로 통일
- [x] 카드 선택 화면 텍스트 및 설명 개선
  - "카드를 선택해주세요" → "그럼 카드를 선택해볼까요?" 수정
  - "카드들의 주파수를 느끼며 신중히 선택해주세요" 설명 텍스트 추가 (Pretendard 폰트, 14px)
- [x] 스프레드 선택 효과 극적 개선
  - 선택된 스프레드 옵션에 극적인 황금색 후광 효과 추가 (`style.css`)
  - 다중 box-shadow (30px, 60px) + `inset` 내부 빛 효과
  - `spreadGlow` 애니메이션으로 2초 주기 펄싱 (밝기 변화)
- [x] 카드 떨림 효과 (주파수 표현) 구현
  - CSS에서 `cardShiver` 애니메이션 정의 (떨림 폭 0.5px, 회전 0.1deg)
  - JavaScript에서 `startCardShiveringEffect()` 함수로 구현
  - 선택되지 않은 카드 중 **1~2장만** 랜덤으로 떨림 (정신없지 않도록 제한)
  - 1초(1000ms)마다 떨림 카드 변경
  - SHUFFLE 화면 벗어날 때 interval 정리 및 클래스 제거
- [x] 카드 테두리 선 두께 축소
  - 2px → 1px로 줄임으로써 더 얇고 세련된 모습 구현 (`style.css`)

### Phase 20: 카드 선택 화면 UX 개선 및 버그 수정 ✅ 완료
- [x] 선택 카드 글로우 애니메이션 속도 개선 (`style.css`)
  - `cardGlow 2s → 0.6s` (렉 걸린 착각 유발하던 느린 속도 해소)
- [x] `shuffle-info` 상단 sticky 고정 (`style.css`)
  - `position: sticky; top: 0; z-index: 100; width: 100%`
  - 78장 그리드 스크롤 중에도 선택 카운트(N/N) 항상 상단 표시
  - 배경 투명(`transparent`) + 텍스트에 `text-shadow(--color-void 글로우)`로 가독성 유지
- [x] SHUFFLE 화면 버튼 수평 배치 고정 (`style.css`)
  - 768px 이하에서도 `flex-direction: row; width: 100%` 유지
  - 버튼 `flex: 1; white-space: nowrap` (텍스트 2줄 방지, 균등 폭)
- [x] 질문입력 화면 버튼 배치 SHUFFLE과 통일 (`style.css`)
  - `#screen-input-question .button-group`도 동일 규칙 적용
- [x] 스프레드 선택 화면 "이전으로" 버튼 개선 (`index.html`, `style.css`)
  - HTML: 단독 `<button>` → `<div class="button-group">` 감싸기 (가운데 정렬 자동 적용)
  - 모바일: `min-width: 160px` (전체 폭 늘어남 방지)
- [x] 카드 선택 취소 시 hover 고착 버그 수정 (`app.js`, `style.css`)
  - 원인: `.selected` 제거 순간 `:hover:not(.selected)` 조건 즉시 충족 → `translateY(-8px)` 고정
  - 수정: 해제 완료 시 `.no-hover` 클래스 250ms 부착 → hover 효과 차단
  - CSS: `.card-back-item.no-hover { transform: none !important }`
  - hover 선택자: `:not(.no-hover)` 조건 추가

### Phase 18: 프론트엔드 애니메이션 강화 + UI 세부 조정 ✅ 완료

#### 18-1. 동적 배경 파티클 시스템 (Canvas 기반)
- [x] `public/js/particles.js` 신규 생성
  - 기존 `body::before` CSS 정적 별 배경 제거 → Canvas 동적 파티클로 교체
  - 150개 별 파티클: 반짝임(opacity 펄싱), 흐름(vx/vy 이동), 마우스 120px 반응 (끌림 효과)
  - 오로라 blob 3개: 보라/파랑 radial-gradient, sin 파형 색상 펄싱
  - 화면 전환 시 파티클 폭발 후 lerp 복귀 (`triggerScreenTransition()`)
  - 모션 블러: `clearRect` 대신 반투명 fill로 잔상 효과 (`rgba(10,10,26,0.18)`)
  - 성능 안전망: `prefers-reduced-motion` / `hardwareConcurrency ≤ 2` 시 파티클 수 절반

#### 18-2. 카드 이펙트 + 오라클 구체 로딩 UI
- [x] `public/js/effects.js` 신규 생성
  - **카드 선택 스파크** (`triggerCardSpark()`): 클릭 시 28개 물리 기반 파티클 폭발
    - gold / arcane / celestial / starlight 색상 믹스
    - 중력(vy += 0.06), 공기저항(vx *= 0.985), 서서히 사라짐(opacity -= 0.015)
    - `MAX_SPARKS = 200` 전역 카운터로 DOM 누적 방지
  - **선택 카드 지속 파티클** (`startSelectedCardParticles()` / `stopSelectedCardParticles()`):
    - 선택 중인 카드에서 매 180ms 소형 파티클 1~2개 위로 흘러올라가며 페이드아웃
    - `data-particle-interval`로 interval ID 관리
  - **카드 플립 Flash** (`triggerFlipFlash(cardElement, intensity)`):
    - 전체 화면 → **카드 개별** `position:absolute` 오버레이로 변경
    - `.card-item`의 `overflow:hidden`으로 카드 경계 자동 클리핑
    - 기본 강도 0.28 (1·3장) / 0.11 (10장), 0.65s ease-out
  - **오라클 수정구슬 로딩 UI** (`startOracleAnimation()` / `stopOracleAnimation()`):
    - Canvas 2D: 외부 글로우 + 구체 본체 입체감 + 내부 안개 + 룬 기호 궤도 공전
    - 룬 기호 8개 타원 궤도, sin(angle) depth로 원근감 (앞쪽: 크고 밝게, 뒤쪽: 작고 희미하게)
    - 캔버스 320×320px (중심 160,160): 글로우(r*2.2=121px)가 경계 전 완전 페이드 → 네모 클리핑 해소
- [x] `public/index.html`: `particles.js` / `effects.js` 스크립트 추가, `<div class="spinner">` → `<canvas class="oracle-canvas">` 교체
- [x] `public/css/style.css`:
  - `body::before` 정적 별 + `@keyframes twinkle` 제거
  - `.oracle-canvas` 320×320px, `@keyframes flashFade`, `.card-spark` 추가
  - `.spinner { display: none }` 처리
- [x] `public/js/app.js`:
  - `showScreen()`: `window.ParticleSystem.triggerScreenTransition()` 훅 추가
  - `setupCardSelectionListeners()`: 카드 선택/해제 시 스파크·지속파티클 연결
  - `fetchReading()`: 로딩 상태 활성화/비활성화 시 오라클 애니메이션 시작/정지 (3곳)
- [x] `public/js/animation.js`: `flipCard()` 내 `triggerFlipFlash(cardElement, intensity)` 연결

#### 18-3. UI 세부 조정
- [x] 카드 선택 스파크 속도 조정: 빠른 폭발 → 느리게 퍼지도록
  - 초기 속도: `3~10 px/f → 1~3.5 px/f`
  - 중력: `0.22 → 0.06`, 공기저항: `0.97 → 0.985`, 투명도 감소: `0.033 → 0.015`
- [x] 카드 플립 빛 효과: 전체 화면 → 카드 개별 적용, 밝기 50% 감소
- [x] 오라클 구체 글로우 네모 클리핑 버그 수정
  - 원인: 캔버스 200×200, 글로우 반지름 121px > 중심~끝 100px → 직사각형 경계 노출
  - 수정: 캔버스 320×320, 중심점 (160,160) → 여유 39px 확보
- [x] 질문 입력 화면 `0/200` 텍스트 textarea에 근접 배치
  - `textarea { margin-bottom: 12px → 4px }`로 8px 위로 이동 (버튼도 동일하게 상승)
- [x] 질문 입력 화면 '질문 없이 진행하기' 링크 제거
  - `index.html`: `<a id="btn-skip-question">` 태그 삭제
  - `app.js`: `btn-skip-question` 이벤트 리스너 삭제
- [x] 질문 입력 화면 '선택사항' 텍스트 주황색(`--color-gold`) 적용
  - `index.html`: `<span style="color: var(--color-gold);">선택사항</span>` 처리

---

## 파일별 책임

### `server.js`
- Express 설정 (정적 파일, 라우터)
- API 키 검증
- cookieParser 미들웨어 등록
- `GET /dev`: `index.html`에 `window.TAROT_APP_MODE = "dev"` 주입 → 개발용 진입점
- 글로벌 에러 핸들러

### `data/cards.js`
- 78장 카드 객체 배열
- 각 카드: id, nameKo, keywords (정방향/역방향), 의미, 수트, 요소 등

### `data/cardImages.js`
- 카드 ID(0~77) → 이미지 파일명 매핑 객체
- `public/js/cardMeta.js`의 imageFile과 동기화
- `routes/reading.js`에서 API 응답 시 사용

### `routes/reading.js`
- `GET /api/limits`: 스프레드별 잠금 상태 반환 (쿠키 기반)
- `DELETE /api/limits`: 모든 제한 쿠키 초기화 (개발 전용)
- `POST /api/reading` 핸들러
  - 24시간 사용 제한 체크 (httpOnly 쿠키, 프로덕션만 적용)
  - 요청 검증 (spread 타입, 카드 수, id 범위, 질문 길이)
  - 카드 데이터 조회 후 `claudeService.generateReading()` 호출
  - 성공 시 `tarot_limit_{spread}` 쿠키 발급

### `prompts/` (프롬프트 파일 — 직접 수정 가능)
- `system.md`: 공통 페르소나·규칙 + 이미지 해석·정역방향·카드 연관성 원칙
- `one.md`: 원 카드 5단계 해석 구조 (최대 600자)
- `three.md`: 쓰리 카드 5단계 해석 구조 (최대 1200자)
- `celtic.md`: 켈틱 크로스 이미지·방향 원칙 + 4단계 해석 구조 (최대 2000자)
- 서버 재시작 없이 저장 즉시 반영 (요청마다 `fs.readFileSync`로 로드)

### `services/claudeService.js`
- Anthropic SDK 래핑
- `spreadInfo`: 스프레드별 포지션 이름·카드 수·프롬프트 파일명 매핑
- `loadPrompt()`: `prompts/*.md` 파일 읽기
- `formatCardsForPrompt()`: 카드 정보 텍스트 포맷팅
- `generateReading()`: Claude API 호출 (스프레드별 타임아웃·max_tokens 분리)

### `public/js/app.js`
- 상태 관리 (현재 화면, 선택된 spread, 질문, 뽑힌 카드 등)
- 화면 전환 로직 (WELCOME → READING)
- API fetch 호출 및 응답 처리

### `public/js/cards.js`
- Fisher-Yates 셔플
- 카드 무작위 선택
- 정방향/역방향 결정

### `public/js/animation.js`
- 카드 플립 애니메이션 제어
- `setTimeout`으로 순차 실행

### `public/js/cardMeta.js`
- 클라이언트용 경량 카드 배열 (id, nameKo, suit, imageFile)
- `app.js`와 `cards.js`에서 사용

---

## 테스트 방법

### API 단독 테스트 (서버 실행 후)

```powershell
# PowerShell
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
1. `npm start` 후 `http://localhost:3000` 접속
2. 3가지 스프레드 각각 테스트
3. 애니메이션 타이밍 확인
4. 오류 케이스 (잘못된 입력, 네트워크 차단 등)

---

## 문제 해결

### "ANTHROPIC_API_KEY is not set"
→ `.env` 파일 확인 및 `sk-ant-...` 키 입력 확인

### 카드 플립 애니메이션 안 보임
→ CSS perspective, transform-style 설정 확인
→ 브라우저 DevTools에서 실제 DOM 상태 확인

### Claude 응답 없음 또는 느림
→ 네트워크 상태 확인
→ 질문이 너무 길지 않은지 확인 (200자 이상 거부)
→ API rate limit 확인

### READING 화면 카드에 이미지가 안 보임
→ **서버 재시작 필요**: `routes/reading.js` 등 백엔드 파일 변경은 서버 재시작(`npm start`) 후 적용됨
→ `data/cardImages.js`가 존재하는지 확인
→ 브라우저 DevTools → Network 탭에서 이미지 URL 응답 코드 확인

### 로딩 후 해석 화면으로 전환되지 않음
→ 브라우저 F12 → Console 탭에서 에러 메시지 확인
→ 에러 모달이 표시되면 메시지 내용으로 원인 파악
→ `Ctrl+Shift+R`로 캐시 무시 새로고침 후 재시도
→ 서버 재시작 후 재시도 (`services/claudeService.js` 등 변경 시 필수)

---

## 나중에 할 것

### 🔴 우선순위 높음 (다음 세션 작업 예정)

- **[모바일] 화면 전환 시 스크롤 위치 초기화**
  - 증상: 스프레드 선택 화면에서 아래로 스크롤 후 켈틱 크로스 선택 → 질문 입력 화면이 스크롤 내려간 상태로 진입
  - 수정: `showScreen()` 호출 시 `window.scrollTo(0, 0)` 또는 해당 screen 컨테이너 `scrollTop = 0` 적용
  - 구현 파일: `public/js/app.js` `showScreen()` 함수

- **[모바일] 카드 선택 시 원형 파티클·빛 발산 효과 성능 저하 개선**
  - 증상: 카드를 선택할수록(3장 이상) 파티클 효과가 누적되어 점점 느려짐
  - 원인 추정: `startSelectedCardParticles()`의 setInterval이 선택된 카드 수만큼 동시 실행
  - 수정 방향: 선택 카드 수에 따라 파티클 발생 빈도 축소 또는 총 파티클 수 상한 강화
  - 구현 파일: `public/js/effects.js`

- **[모바일] 카드 선택 화면 하단 버튼 표시 조건에 선택 완료 추가**
  - 현재: 마지막 카드(78번째)가 뷰포트에 들어올 때만 버튼 고정
  - 수정: 필요 선택 수를 모두 채웠을 때도 버튼 `is-pinned` 활성화
  - 구현 파일: `public/js/app.js` `updateCardSelectionUI()` 및 `setupCardSelectionListeners()` 내 선택 완료 감지 지점

- **[모바일] CARD_REVEAL 화면 카드 배치 재구성**
  - 현재: 모바일에서 1열 또는 2열 세로 나열로 길게 늘어져 어색함
  - 수정: 1장 → 1열 1장 / 3장 → 1열 3장(가로) / 10장 → 2행×5열
  - 카드 내 텍스트(위치 레이블·카드명·REVERSE) 폰트 크기 축소
  - 구현 파일: `public/css/style.css` `@media (max-width: 768px)` 내 `#cards-display` 그리드

- **[모바일] READING 화면 카드 목록 최상단 고정 + 카드 텍스트 축소**
  - 현재: 모바일에서 카드 목록(좌우 패널)이 가로 스크롤 바 형태로 해석 위에 위치
  - 수정: 카드 목록을 화면 최상단에 `position: sticky; top: 0`으로 고정
  - 카드 내 텍스트(카드명, 위치 레이블) 폰트 크기 매우 작게 축소 (9~10px)
  - 구현 파일: `public/css/style.css`, `public/js/app.js` `syncLayout()`

- **[모바일] 스프레드 선택 화면 아이콘 및 레이아웃 개편**
  - 현재: 카드가 너무 크고 설명 텍스트가 항상 노출됨
  - 수정: 아이콘 3개 + 제목만 표시 → 탭 시 설명 + "선택하기" 버튼 펼쳐지는 아코디언 방식
  - 아이콘 교체: 원 카드 → 카드 1장 SVG, 쓰리 카드 → 카드 3장 겹친 SVG, 켈틱 크로스는 ⊕ 유지
  - 구현 파일: `public/index.html`, `public/css/style.css`, `public/js/app.js`

- **켈틱 크로스 카드 시인성 개선**: READING 화면에서 카드 순번 명확화
  
  **현재 문제:**
  - 해석 텍스트: "첫 번째 카드는...", "The Fool은..." 혼용
  - 사용자: 좌우 카드 목록에서 어떤 카드가 몇 번인지 알 수 없음
  - 결과: 텍스트와 카드 시각 연결 어려움
  
  **해결 방안:**
  - READING 화면 (켈틱 크로스만): 좌우 카드 영역에 **코너 뱃지** 형태 번호 표시
    - 디자인: 카드 좌상단 코너 뱃지, 숫자만 표시 (예: `1`, `2`, ... `10`)
    - 심미적 스타일 적용 (그라디언트 또는 글로우 효과 포함)
  
  **구현 파일:**
  - `public/js/app.js`: `displayReading()` 함수 내 켈틱 크로스 분기
  - `public/css/style.css`: `.card-number-badge` 클래스 신규 추가

### ⭐ 우선순위 낮음

- **프리셋 질문**: UI에 추천 질문 버튼 추가 가능
- **히스토리**: 리딩 결과 저장 기능 (localStorage 또는 간단한 JSON 파일)
- **테마 전환**: 다크/라이트 모드 추가 가능
- **소리 효과**: 카드 플립 시 효과음 추가 가능

---

## 참고

- 현재 환경: Windows 11 Pro, Node.js v24.15.0
- Claude Code 사용 중 (별도 IDE 불필요)
- Git 관리 중: 각 Phase 완료 후 `git push`

---

마지막 수정: 2026-05-28 (Phase 23 모바일 UI/UX 세부 개선 및 카드 떨림 효과 구현)
