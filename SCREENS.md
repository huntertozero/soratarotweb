# 타로 앱 화면 구성 문서

> 작업 지시 시 화면 ID / 컴포넌트명으로 명시하면 더 정확한 작업이 가능합니다.
> 변경사항이 생기면 이 문서도 함께 업데이트합니다.
> 작작업 지시 방법 예시:
  - "READING 화면(#screen-reading) 좌측 카드 컬럼(#cards-summary-left)에 ..."
  - "SHUFFLE 화면의 카드 그리드(#cards-grid) .shivering 애니메이션 속도를 ..."
  - "켈틱 크로스의 번호 뱃지(.card-number-badge) 디자인을 ..."

마지막 수정: 2026-05-30 (Phase 31 기준)

---

## 앱 전체 구조

```
single-page app (index.html)
│
├── #screen-welcome          1. 웰컴 화면
├── #screen-select-spread    2. 스프레드 선택 화면
├── #screen-input-question   3. 질문 입력 화면
├── #screen-shuffle          4. 카드 선택 화면
├── #screen-card-reveal      5. 카드 공개 화면
├── #screen-reading          6. 해석 결과 화면
└── #modal-error             공통 - 에러 모달
```

**화면 전환 흐름:**
```
WELCOME → SELECT_SPREAD → INPUT_QUESTION → SHUFFLE → CARD_REVEAL → READING
                ↑──────── 이전으로 ────────────────────────────────────↓(처음으로)
```

---

## 1. WELCOME 화면 (`#screen-welcome`)

**역할:** 앱 진입점. 타이틀과 시작 버튼만 표시.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 카드 덱 아이콘 | `.deck-icon` | 3장이 겹친 CSS 전용 카드 일러스트 |
| 메인 제목 | `.title` | "신비로운 타로 리딩" (Noto Serif KR, 48px) |
| 부제목 | `.subtitle` | "카드가 당신의 길을 안내합니다" (보라색) |
| 설명 텍스트 | `.description` | AI 해석 안내 1~2줄 |
| 시작 버튼 | `#btn-start-reading` | → SELECT_SPREAD 이동 |

### 특이사항
- Critical CSS 인라인 처리: 외부 CSS 로드 전에도 정상 렌더링 보장
- 반응형: 768px → 32px 제목, 480px → 28px 제목

---

## 2. SELECT_SPREAD 화면 (`#screen-select-spread`)

**역할:** 리딩 방식(스프레드) 선택. 3종 카드 슬라이더.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 제목 | `h2` | "어떤 리딩을 원하십니까?" |
| 부제목 | `.spread-subtitle` | "24시간마다 한 번씩" 주황색 강조 텍스트 |
| 슬라이더 래퍼 | `#spread-slider-wrapper` | 카드 3장 감싸는 슬라이더 컨테이너 |
| 슬라이더 트랙 | `#spread-slider-track` | 실제 슬라이드가 나열되는 영역 |
| 원 카드 슬라이드 | `.spread-slide[data-spread="one"]` | ✦ 아이콘, "원 카드", "오늘의 메시지" |
| 쓰리 카드 슬라이드 | `.spread-slide[data-spread="three"]` | ▲ 아이콘, "쓰리 카드", "과거, 현재 그리고 미래" |
| 켈틱 크로스 슬라이드 | `.spread-slide[data-spread="celtic"]` | ⊕ 아이콘, "켈틱 크로스", "심층 분석" |
| 페이지 도트 | `#spread-dots > .spread-dot` | 현재 슬라이드 인디케이터 (모바일) |

### 기능
- **PC**: 3장 카드 나란히 그리드 배치, 클릭으로 선택
- **모바일**: 스택 카드 슬라이더, 터치 스와이프로 전환, 페이지 도트 클릭 가능
- **24시간 제한**: 잠긴 카드에 `.locked` 클래스 + `.spread-countdown` 카운트다운 표시
- **잠금 카드**: 반투명 오버레이, 클릭 차단, 남은 시간 "N시간 N분 후 사용 가능" 표시
- 선택된 카드에 황금색 후광 펄싱 애니메이션 (`spreadGlow`)
- 이전 버튼 없음 (뒤로가기는 브라우저 or `#btn-back-welcome`가 있을 경우)

### 개발 모드
- `http://localhost:3000/dev` 접속 시 `IS_DEV_MODE = true` → 잠금 UI 완전 비활성화

---

## 3. INPUT_QUESTION 화면 (`#screen-input-question`)

**역할:** 질문 입력 (선택사항, 최대 200자).

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 제목 | `h2` | "어떤 것이 궁금하세요?" |
| 안내 텍스트 | `.question-hint` | "선택사항" 주황색 강조, 200자 제한 안내 |
| 텍스트에어리어 | `#input-question-text` | rows=4, maxlength=200 |
| 글자 수 카운터 | `#char-count` | "N / 200" 형태 |
| 이전 버튼 | `#btn-back-spread` | → SELECT_SPREAD 이동 |
| 다음 버튼 | `#btn-next-question` | → SHUFFLE 이동 |

### 기능
- `input` 이벤트로 실시간 글자 수 카운팅
- 질문 없이 다음 버튼 클릭 시 빈 문자열로 진행 (선택사항)
- 버튼 그룹 수평 배치 고정 (768px 이하에서도 `flex-direction: row` 유지)

---

## 4. SHUFFLE 화면 (`#screen-shuffle`)

**역할:** 78장 카드 뒷면 그리드에서 원하는 카드 직접 선택.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 상단 고정 정보 | `.shuffle-info` | `position: sticky; top: 0` |
| 메시지 | `#shuffle-message` | "그럼 카드를 선택해볼까요?" |
| 부가 설명 | (인라인 `<p>`) | "카드들의 주파수를 느끼며 신중히 선택해주세요" |
| 선택 카운터 | `#shuffle-count` | "N / N" 형태 (예: "3 / 10") |
| 카드 그리드 | `#cards-grid` | 78장 `.card-back-item` 동적 생성 |
| 이전 버튼 | `#btn-back-question` | → INPUT_QUESTION, selectedCards 초기화 |
| 선택 완료 버튼 | `#btn-cards-selected` | 선택 완료 전 `disabled`, → CARD_REVEAL |

### 카드 그리드 (`#cards-grid`)
- 78장의 `.card-back-item`을 진입 시마다 랜덤 순서로 생성
- 별(★) 아이콘 중앙 표시
- 상태 클래스:
  - `.selected`: 선택된 카드 (금빛 글로우 + glow 애니메이션 0.6s)
  - `.disabled`: 필요 장수 초과 시 선택 불가 표시
  - `.selecting`: 선택 중 전환 애니메이션
  - `.deselecting`: 선택 해제 중 전환 애니메이션
  - `.no-hover`: 해제 직후 hover 고착 방지 (250ms 임시 부착)
  - `.shivering`: 카드 떨림 효과 (선택 안 된 카드 중 1~2장, 1초마다 랜덤 변경)

### 기능
- 스프레드별 필요 카드 수: `one=1` / `three=3` / `celtic=10`
- 선택 완료 시 버튼 자동 활성화 + 하단 고정 (`is-pinned`)
- **모바일 버튼 핀**: `IntersectionObserver`로 마지막 카드 가시성 감지 → 버튼 자동 고정/해제
- 정방향/역방향 50% 랜덤 결정 (선택 시점)
- 반응형: 768px→9열, 600px→7열, 480px→6열

---

## 5. CARD_REVEAL 화면 (`#screen-card-reveal`)

**역할:** 선택한 카드를 순차 플립 후 해석 로딩.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 카드 표시 영역 | `#cards-display` | 스프레드 클래스 동적 부여 (`spread-one` / `spread-three` / `spread-celtic`) |
| 카드 아이템 | `.card-item` | 각 카드 플립 컨테이너 |
| 로딩 상태 | `#loading-state` | 플립 완료 후 활성화 |
| 오라클 구체 | `.oracle-canvas` | Canvas 2D 수정구슬 애니메이션 (320×320px, CSS 160px 표시) |
| 로딩 텍스트 | `.loading-text` | 스프레드별 소요시간 안내 |
| 해석 요청 버튼 | `#btn-get-reading` | 현재 자동 호출로 `display:none` 상태 |

### 카드 아이템 구조 (`.card-item`)
```
.card-item
└── .card-container
    ├── .card-position-label   위치 레이블 (쓰리 카드: 가운데, 켈틱: 상단)
    └── .card-inner            3D 플립 컨테이너
        ├── .card-back         초기 표시 (별 아이콘 뒷면)
        └── .card-front        플립 후 표시 (카드 이미지 + 카드 정보)
            ├── .card-image    역방향 시 scaleY(-1)
            ├── .card-direction  "Reverse" 텍스트 (파란색)
            └── .card-name     카드 이름 (한글)
```

### 플립 애니메이션
- 500ms 간격으로 카드 순차 플립 (`flipCardsSequentially`)
- 플립 시 하이라이트 스캔 바 효과 (`card-highlight`, 위→아래 0.7s)
- 플립 시 카드 개별 Flash 효과 (1·3장: 강도 0.28, 10장: 0.11)
- 역방향 카드: `.card-inner.reversed` 클래스로 180도 회전
- **켈틱 크로스 플립 순서**:
  - PC: 1→2→3→4→5→6→7→8→9→10 (DOM 순서)
  - 모바일: 1→3→4→5→6→8→2→7→9→10 (레이아웃 시각 순서)

### 모바일 레이아웃 (`#cards-display`)
- **원 카드**: `max-width: 150px`, 1장 중앙
- **쓰리 카드**: `repeat(3, 1fr)` 3열 가로
- **켈틱 크로스**: `repeat(12, 1fr)` 12열 기반, 3+3+2+2 배치
  - 1행: 1, 3, 4번 / 2행: 5, 6, 8번 / 3행: 2, 7번 / 4행: 9, 10번

### 로딩 메시지 (스프레드별)
| 스프레드 | 메시지 |
|----------|--------|
| 원 카드 | "최대 20초 정도 걸려요" |
| 쓰리 카드 | "최대 30초 정도 걸려요" |
| 켈틱 크로스 | "최대 40초 정도 걸려요" |

---

## 6. READING 화면 (`#screen-reading`)

**역할:** AI 해석 결과 표시. 3열 레이아웃 (좌카드 | 중해석 | 우카드).

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 카드 컨테이너 | `.cards-summary-wrapper` | 좌우 카드 컬럼 감싸는 래퍼 |
| 좌측 카드 컬럼 | `#cards-summary-left` | cards[0~4] 표시 (PC: `position:fixed`) |
| 우측 카드 컬럼 | `#cards-summary-right` | cards[5~9] 표시 (PC: `position:fixed`) |
| 해석 중앙 래퍼 | `.reading-content-wrapper` | 질문박스 + 해석텍스트 + 버튼 |
| 질문 박스 | `#reading-question` | 질문 있을 때만 표시, 파란 테두리 |
| 질문 레이블 | `.reading-question-label` | "💬 질문" |
| 질문 텍스트 | `#reading-question-text` | 사용자 입력 질문 |
| 해석 컨텐츠 | `.reading-content` | marked.js 마크다운 렌더링 영역 |
| 해석 텍스트 | `#reading-text` | Claude AI 응답 HTML |
| 처음으로 버튼 | `#btn-home` | 모든 상태 초기화 → WELCOME |

### 카드 요약 아이템 (`.card-summary-item`)
```
.card-summary-item
├── .csm-bg-image        카드 이미지 (z-index:0, 역방향: scaleY(-1))
├── .csm-overlay         반투명 오버레이 (z-index:1, 켈틱 크로스 제외)
├── .card-number-badge   번호 뱃지 (z-index:2, 켈틱 크로스만 표시, 1~10)
├── .csm-position-label  위치 레이블 (z-index:2, 1카드 제외)
└── .csm-card-info       카드 이름/방향 (z-index:2)
    ├── .csm-direction   "REVERSE" 텍스트 (파란색)
    └── .csm-name        카드 이름 (한글)
```

### PC 레이아웃
- 좌우 카드 컬럼: JS `syncLayout()`으로 `.reading-content-wrapper` 좌우에 `position:fixed` 배치
- 카드-해석 간격: 15px 고정
- 높이 동기화: 카드 컬럼 높이 = 해석 영역 높이
- scroll / resize 이벤트마다 `syncLayout()` 재실행

### 모바일 레이아웃 (768px 이하)
- 1열 세로 스택 (`grid-template-columns: 1fr`)
- 카드 컬럼: `position:static`, 가로 스크롤 (`overflow-x: auto`)
- JS 인라인 스타일 초기화 후 CSS 미디어쿼리에 위임

### 해석 텍스트 스타일
- `marked.js` v12 마크다운 파싱 (`breaks: true` - 단일 줄바꿈도 `<br>`)
- 마크다운 요소 스타일: 중첩 리스트, `em`, `hr`, 제목 여백 등

---

## 공통 - 에러 모달 (`#modal-error`)

**역할:** API 오류, 사용 제한 초과 등 모든 에러 표시.

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 모달 오버레이 | `#modal-error.modal` | 활성화: `.modal.active` |
| 제목 | `h3` | "오류가 발생했습니다" |
| 에러 메시지 | `#error-message` | 동적으로 텍스트 주입 |
| 닫기 버튼 | `#btn-close-error` | 모달 비활성화 |

---

## 공통 - 배경 레이어

| 레이어 | 파일 | 설명 |
|--------|------|------|
| Canvas 파티클 | `particles.js` | 150개 별 파티클 + 오로라 blob 3개, 마우스 반응 |
| 화면 전환 효과 | `particles.js` | `triggerScreenTransition()` - 파티클 폭발 후 복귀 |

---

## 공통 - 이펙트 시스템 (`effects.js`)

| 이펙트 | 함수 | 발동 시점 |
|--------|------|-----------|
| 카드 선택 스파크 | `triggerCardSpark()` | (현재 비활성, 성능 최적화로 제거됨) |
| 지속 파티클 | `startSelectedCardParticles()` | (현재 비활성) |
| 카드 플립 Flash | `triggerFlipFlash(el, intensity)` | CARD_REVEAL에서 카드 플립 시 |
| 오라클 구체 | `startOracleAnimation()` / `stopOracleAnimation()` | CARD_REVEAL 로딩 시작/종료 |

---

## 스프레드별 비교표

| 항목 | 원 카드 (one) | 쓰리 카드 (three) | 켈틱 크로스 (celtic) |
|------|--------------|-------------------|----------------------|
| 카드 수 | 1장 | 3장 | 10장 |
| 위치 레이블 | 없음 | 과거/현재/미래 (중앙) | 10위치 명칭 (상단) |
| 번호 뱃지 | 없음 | 없음 | 1~10 (READING 화면) |
| 오버레이 | 있음 | 있음 | 없음 |
| API max_tokens | 1024 | 1500 | 4000 |
| API 타임아웃 | 30초 | 45초 | 90초 |
| 로딩 안내 | 최대 20초 | 최대 30초 | 최대 40초 |
| 플립 순서 (모바일) | - | 좌→우 | 1,3,4,5,6,8,2,7,9,10 |
| 프롬프트 파일 | `prompts/one.md` | `prompts/three.md` | `prompts/celtic.md` |

---

## 켈틱 크로스 포지션 명칭

| 번호 | 명칭 |
|------|------|
| 1 | 현재 상황 |
| 2 | 가로막는 것 |
| 3 | 의식적 목표 |
| 4 | 무의식적 기반 |
| 5 | 먼 과거 |
| 6 | 가까운 미래 |
| 7 | 나의 태도 |
| 8 | 외부 영향 |
| 9 | 희망과 두려움 |
| 10 | 최종 결과 |
