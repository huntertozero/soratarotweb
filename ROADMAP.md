# 타로 리딩 웹 앱 - 구현 로드맵

## 프로젝트 타임라인

**전체 예상 기간**: 약 4-5시간 (순차 작업)  
**마지막 업데이트**: 2026-05-25

---

## Phase 1: 기반 구조 (약 30분)

### 목표
Node.js 프로젝트 초기화, Express 서버 최소 구성

### 태스크

| # | 작업 | 상태 | 소요 시간 |
|----|------|------|---------|
| 1.1 | `npm install @anthropic-ai/sdk dotenv express` | ⏳ | 3분 |
| 1.2 | `.env` 파일 생성 (ANTHROPIC_API_KEY 입력) | ⏳ | 2분 |
| 1.3 | `.gitignore` 생성 (node_modules, .env 등) | ⏳ | 2분 |
| 1.4 | `server.js` 기본 구조 작성 | ⏳ | 10분 |
| 1.5 | `public/` 폴더 생성 및 `index.html` 최소 마크업 | ⏳ | 8분 |
| 1.6 | `npm start` 실행 확인 (http://localhost:3000) | ⏳ | 5분 |

### 체크리스트
- [ ] 모든 의존성 설치 완료
- [ ] `.env` 파일에 유효한 API 키 설정
- [ ] 서버 시작 시 "타로 리딩 서버가 포트 3000에서 실행 중입니다" 메시지 출력
- [ ] 브라우저에서 `localhost:3000` 접속 가능

---

## Phase 2: 카드 데이터 (약 1시간)

### 목표
78장 카드 데이터 완성, 클라이언트용 경량 메타 작성

### 태스크

| # | 작업 | 상태 | 소요 시간 |
|----|------|------|---------|
| 2.1 | `data/cards.js` 구조 설계 | ⏳ | 10분 |
| 2.2 | 메이저 아르카나 22장 (0~21) 작성 | ⏳ | 25분 |
| 2.3 | 마이너 아르카나 56장 (22~77) 작성 | ⏳ | 20분 |
| 2.4 | `public/js/cardMeta.js` 경량 배열 생성 | ⏳ | 5분 |

### 데이터 필드 정의

**`data/cards.js` (서버용 - full data)**
```javascript
{
  id: 0-77,
  name: "English Name",
  nameKo: "한국어 이름",
  arcana: "major" | "minor",
  suit?: "wands" | "cups" | "swords" | "pentacles",
  keywords: { upright: [...], reversed: [...] },
  uprightMeaning: "정방향 의미",
  reversedMeaning: "역방향 의미",
  element: "요소",
  description?: "추가 설명"
}
```

**`public/js/cardMeta.js` (클라이언트용 - lightweight)**
```javascript
{
  id: 0-77,
  nameKo: "한국어 이름",
  suit?: "wands" | "cups" | "swords" | "pentacles",
  imageFile: "00-the-fool.jpg"
}
```

### 체크리스트
- [ ] `data/cards.js` 메이저 아르카나 22장 모두 작성
- [ ] `data/cards.js` 마이너 아르카나 56장 모두 작성 (4수트 × 14개)
- [ ] 모든 카드 id가 0~77 범위 맞음
- [ ] 중복 id 없음 (78개 정확히)
- [ ] `public/js/cardMeta.js` 78개 항목 포함
- [ ] `module.exports` 또는 `export` 구문 정확함

---

## Phase 3: 백엔드 API (약 45분)

### 목표
Claude API 호출, 검증 로직, 라우터 완성

### 태스크

| # | 작업 | 상태 | 소요 시간 |
|----|------|------|---------|
| 3.1 | `services/claudeService.js` - 프롬프트 빌더 | ⏳ | 15분 |
| 3.2 | `services/claudeService.js` - Anthropic SDK 호출 | ⏳ | 10분 |
| 3.3 | `routes/reading.js` - 검증 로직 | ⏳ | 12분 |
| 3.4 | `routes/reading.js` - 에러 처리 | ⏳ | 8분 |
| 3.5 | `server.js` 라우터 연결 및 테스트 | ⏳ | 10분 |

### API 요청/응답 명세

**Request: `POST /api/reading`**
```json
{
  "spread": "one" | "three" | "celtic",
  "question": "사용자 질문 (선택, 최대 200자)",
  "cards": [
    { "id": 0, "isReversed": false },
    ...
  ]
}
```

**Response (200)**
```json
{
  "reading": "Claude가 생성한 해석 (마크다운)",
  "cards": [
    { "id": 0, "nameKo": "광대", "isReversed": false, "position": "현재", "keywords": [...] }
  ]
}
```

### 검증 규칙
- `spread`: "one" | "three" | "celtic" 만 허용
- 카드 수: one→1장, three→3장, celtic→10장 정확히
- id 범위: 0~77
- 중복 카드 금지 (Set 사용)
- 질문 길이: 최대 200자 (초과 시 400)
- API 키 미설정 시 서버 시작 불가 (process.exit(1))

### Claude 프롬프트 설계

**시스템 프롬프트** (공통)
```
당신은 수십 년 경험의 신비로운 타로 마스터입니다.
- 정방향/역방향 에너지를 명확히 구분
- 카드 간 서사적 흐름 발견
- 판단하지 않고 가능성과 성찰 제시
- 신비롭고 시적인 언어 사용
- 한국어, 마크다운 형식
```

**유저 프롬프트** (spread별)
- **한 장**: 카드 1개 + 키워드 → "통찰과 앞으로의 에너지"
- **3장**: 과거/현재/미래 3개 → "이야기와 에너지 변화"
- **켈틱 크로스**: 10개 위치별 의미 + 각 카드 → "전체 메시지"

### 체크리스트
- [ ] `claudeService.js`가 환경변수에서 API 키 읽음
- [ ] `AbortController`로 30초 타임아웃 설정
- [ ] spread별 프롬프트가 서로 다름
- [ ] 검증 실패 시 400 반환
- [ ] 서버 에러 시 500 + 명확한 메시지
- [ ] curl 또는 PowerShell로 직접 테스트 성공

---

## Phase 4: 프론트엔드 UI (약 1.5시간)

### 목표
화면 레이아웃, 상태 관리, 이벤트 핸들링

### 태스크

| # | 작업 | 상태 | 소요 시간 |
|----|------|------|---------|
| 4.1 | `public/css/style.css` - 전체 레이아웃 | ⏳ | 30분 |
| 4.2 | `public/css/style.css` - 신비로운 테마 (색상, 폰트) | ⏳ | 20분 |
| 4.3 | `public/index.html` - 화면 상태별 마크업 | ⏳ | 20분 |
| 4.4 | `public/js/app.js` - 상태 관리 기본 구조 | ⏳ | 15분 |
| 4.5 | `public/js/app.js` - 화면 전환 로직 | ⏳ | 10min |
| 4.6 | `public/js/cards.js` - 셔플 + 선택 로직 | ⏳ | 5분 |

### 화면 상태 흐름

```
WELCOME
  ↓
SELECT_SPREAD (한 장 / 3장 / 켈틱 크로스)
  ↓
INPUT_QUESTION (질문 입력 또는 스킵)
  ↓
SHUFFLE (회오리 애니메이션, 3초 후 자동 진행)
  ↓
CARD_REVEAL (카드 배치, 순차 플립)
  ↓
READING (Claude 해석 표시)
  ↓
[다시 하기] → CARD_REVEAL로 돌아감
[다른 스프레드] → SELECT_SPREAD로 돌아감
```

### 테마 색상 (CSS 변수)

```css
--color-void: #0a0a1a;
--color-deep-space: #0f0f2e;      /* 주 배경 */
--color-nebula: #1a1040;           /* 카드 배경 */
--color-mystic: #6b21a8;           /* 메인 퍼플 */
--color-arcane: #9333ea;           /* 밝은 퍼플 */
--color-gold: #f59e0b;             /* 골드 강조 */
--color-silver: #e2e8f0;           /* 본문 텍스트 */
--color-starlight: #fef3c7;        /* 강조 */
```

### 체크리스트
- [ ] 모든 화면 상태가 `display` 토글로 전환됨
- [ ] 색상 변수 CSS `:root`에 정의됨
- [ ] Google Fonts (Noto Serif/Sans KR) 로드됨
- [ ] 모든 UI 텍스트가 한국어임
- [ ] 반응형 CSS (모바일 최소 360px 대응)
- [ ] 버튼 호버 상태 확인됨

---

## Phase 5: 애니메이션 & 통합 (약 1시간)

### 목표
카드 플립, API 통합, 마크다운 렌더링

### 태스크

| # | 작업 | 상태 | 소요 시간 |
|----|------|------|---------|
| 5.1 | `public/js/animation.js` - 카드 플립 CSS | ⏳ | 10분 |
| 5.2 | `public/js/animation.js` - 순차 플립 로직 | ⏳ | 10분 |
| 5.3 | `public/js/app.js` - fetch로 `/api/reading` 호출 | ⏳ | 10분 |
| 5.4 | `public/js/app.js` - 마크다운 렌더링 (marked.js 또는 간단한 변환) | ⏳ | 15분 |
| 5.5 | 전체 플로우 UI 테스트 (3가지 스프레드) | ⏳ | 10분 |
| 5.6 | 반응형 CSS 최종 조정 + 엣지 케이스 | ⏳ | 5분 |

### 카드 플립 애니메이션

**CSS**
```css
.card-container { perspective: 1000px; }
.card-inner {
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
}
.card-inner.flipped { transform: rotateY(180deg); }
.card-inner.flipped.reversed { transform: rotateY(180deg) rotateZ(180deg); }
.card-front, .card-back { position: absolute; backface-visibility: hidden; }
.card-front { transform: rotateY(180deg); }
```

**JS**
```javascript
setTimeout(() => {
  el.querySelector('.card-inner').classList.add('flipped');
  if (isReversed) el.querySelector('.card-inner').classList.add('reversed');
}, delayMs);
```

### 마크다운 렌더링

옵션 1: `marked.js` 라이브러리 추가  
옵션 2: 간단한 정규식 변환 (굵게, 제목, 리스트)

선택: **옵션 2** (번들러 없으므로 라이브러리 추가 피함)

```javascript
function simpleMarkdownToHtml(text) {
  return text
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
```

### 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| 네트워크 오류 | `fetch` try/catch, 오류 모달 표시 |
| Claude 타임아웃 | "재시도" 버튼 제공 |
| 빠른 연속 클릭 | 버튼 `disabled` 처리 |
| 모바일 터치 | `touch-action: manipulation` |

### 체크리스트
- [ ] 카드 플립 애니메이션이 부드럽고 순차 실행됨
- [ ] 역방향 카드가 180도 회전해서 표시됨
- [ ] Claude 응답이 마크다운 형식으로 렌더링됨
- [ ] 로딩 중 "생각 중..." 스피너 표시됨
- [ ] 3가지 스프레드 모두 전체 플로우 테스트 성공
- [ ] 모바일 (360px~768px) 레이아웃 확인됨

---

## 테스트 계획

### 1. 단위 테스트 (각 파일별)

**`data/cards.js`**
- [ ] 78개 카드 정확히 존재
- [ ] 중복 id 없음
- [ ] 각 카드 필수 필드 존재

**`public/js/cards.js`**
- [ ] 셔플 후 카드 순서 다름
- [ ] 정방향/역방향 비율 ~50/50

**`routes/reading.js`**
- [ ] 유효한 요청 → 200 + reading
- [ ] 잘못된 spread → 400
- [ ] 카드 수 불일치 → 400
- [ ] 중복 카드 id → 400

### 2. 통합 테스트 (전체 플로우)

**한 장 스프레드**
- [ ] 시작 → 스프레드 선택 → 질문 입력 → 셔플 → 카드 공개 → 해석 표시 → 완료

**3장 스프레드**
- [ ] 과거/현재/미래 3개 카드 배치 확인
- [ ] 레이아웃이 시각적으로 명확함

**켈틱 크로스**
- [ ] 10개 카드 정확한 위치에 배치
- [ ] 각 위치별 의미가 프롬프트에 반영됨

### 3. UI/UX 테스트

- [ ] 모든 버튼 클릭 가능
- [ ] 로딩 중 버튼 비활성화
- [ ] 오류 메시지가 사용자 친화적
- [ ] 색상/폰트가 신비로운 분위기 연출
- [ ] 모바일 화면에서 버튼/카드 크기 충분함

### 4. 엣지 케이스 테스트

- [ ] API 키 없이 시작 → 명확한 오류
- [ ] 네트워크 차단 상태 → 오류 표시
- [ ] 질문 200자 초과 → 거부
- [ ] 빠른 연속 클릭 → 첫 요청만 전송

---

## 제공될 산출물

### 코드
- `server.js` (Express 진입점)
- `data/cards.js` (78장 카드 데이터)
- `routes/reading.js` (API 라우터)
- `services/claudeService.js` (Claude 호출)
- `public/index.html` (SPA 마크업)
- `public/css/style.css` (신비로운 테마)
- `public/js/app.js` (상태 관리)
- `public/js/cards.js` (셔플/선택)
- `public/js/animation.js` (카드 플립)
- `public/js/cardMeta.js` (경량 메타)

### 설정 파일
- `package.json` (의존성 + 스크립트)
- `.env.example` (환경변수 템플릿)
- `.gitignore` (git 제외 파일)

### 문서
- `CLAUDE.md` (개발 가이드)
- `ROADMAP.md` (이 파일)

---

## 나중에 할 수 있는 기능

- **카드 이미지**: `public/img/cards/` 에 jpg 추가하면 자동 반영 (onerror 폴백)
- **프리셋 질문**: "내 미래는?" 같은 추천 질문 버튼
- **히스토리**: localStorage에 리딩 결과 저장
- **프린트**: 결과를 PDF로 다운로드
- **공유**: 결과 링크 생성 및 공유
- **테마 전환**: 다크/라이트 모드 토글
- **음악**: 백그라운드 음악 (선택사항)

---

## 노트

- **진행 중**: Phase 1 준비 단계
- **완료 예상 일시**: 2026-05-25 ~ 2026-05-26 (소요 4-5시간)
- **Git 커밋**: 각 파일 완성 후 즉시 커밋 (배치 커밋 금지)
- **테스트**: 각 Phase 완료 후 수동 테스트 우선순위
