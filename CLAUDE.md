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

---

## 파일별 책임

### `server.js`
- Express 설정 (정적 파일, 라우터)
- API 키 검증
- 글로벌 에러 핸들러

### `data/cards.js`
- 78장 카드 객체 배열
- 각 카드: id, nameKo, keywords (정방향/역방향), 의미, 수트, 요소 등

### `data/cardImages.js`
- 카드 ID(0~77) → 이미지 파일명 매핑 객체
- `public/js/cardMeta.js`의 imageFile과 동기화
- `routes/reading.js`에서 API 응답 시 사용

### `routes/reading.js`
- `POST /api/reading` 핸들러
- 요청 검증 (spread 타입, 카드 수, id 범위, 질문 길이)
- 카드 데이터 조회 후 `claudeService.generateReading()` 호출

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

- **프리셋 질문**: UI에 추천 질문 버튼 추가 가능
- **히스토리**: 리딩 결과 저장 기능 (localStorage 또는 간단한 JSON 파일)
- **테마 전환**: 다크/라이트 모드 추가 가능
- **소리 효과**: 카드 플립 시 효과음 추가 가능
- **모바일 최적화**: 터치 이벤트 및 반응형 개선

---

## 참고

- 현재 환경: Windows 11 Pro, Node.js v24.15.0
- Claude Code 사용 중 (별도 IDE 불필요)
- Git 관리 중: 각 Phase 완료 후 `git push`

---

마지막 수정: 2026-05-27 (Phase 13 마크다운 렌더러 교체 + 프롬프트 고도화 완성)
