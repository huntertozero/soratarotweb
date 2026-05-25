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

---

## 파일별 책임

### `server.js`
- Express 설정 (정적 파일, 라우터)
- API 키 검증
- 글로벌 에러 핸들러

### `data/cards.js`
- 78장 카드 객체 배열
- 각 카드: id, nameKo, keywords (정방향/역방향), 의미, 수트, 요소 등

### `routes/reading.js`
- `POST /api/reading` 핸들러
- 요청 검증 (spread 타입, 카드 수, id 범위, 질문 길이)
- 카드 데이터 조회 후 `claudeService.generateReading()` 호출

### `services/claudeService.js`
- Anthropic SDK 래핑
- 프롬프트 생성 (spread별)
- Claude 응답 반환

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

---

## 나중에 할 것

- **이미지 추가**: `public/img/cards/` 에 jpg 파일 추가하면 자동 적용
  - 파일명: `00-the-fool.jpg`, `22-ace-of-wands.jpg` 등
  - 나머지 처리는 `onerror` 폴백이 자동 처리
- **프리셋 질문**: UI에 추천 질문 버튼 추가 가능
- **히스토리**: 리딩 결과 저장 기능 (localStorage 또는 간단한 JSON 파일)
- **테마 전환**: 다크/라이트 모드 추가 가능

---

## 참고

- 현재 환경: Windows 11 Pro, Node.js v24.15.0
- Claude Code 사용 중 (별도 IDE 불필요)
- Git 관리 중: 각 Phase 완료 후 `git push`

---

마지막 수정: 2026-05-25 (Phase 6 UI/UX 개선 완료)
