# 타로 앱 화면 구성 문서

> 작업 지시 시 화면 ID / 컴포넌트명으로 명시하면 더 정확한 작업이 가능합니다.
> 변경사항이 생기면 이 문서도 함께 업데이트합니다.
> 작업 지시 방법 예시:
  - "READING 화면(#screen-reading) 좌측 카드 컬럼(#cards-summary-left)에 ..."
  - "SHUFFLE 화면의 카드 그리드(#cards-grid) .shivering 애니메이션 속도를 ..."
  - "켈틱 크로스의 번호 뱃지(.card-number-badge) 디자인을 ..."

마지막 수정: 2026-06-09 (Phase 52 기준)

---

## 공통 폰트·색상 변수

| 변수 | 값 | 용도 |
|------|----|------|
| `--font-serif` | Noto Serif KR | 화면 h2·#shuffle-message 제목 |
| `--font-sans` | Pretendard | 본문·UI 전체 기본 |
| `--color-starlight` | `#fef3c7` | 주요 제목·버튼 텍스트 |
| `--color-silver` | `#e2e8f0` | 본문·설명 텍스트 |
| `--color-arcane` | `#9333ea` | 부제목 강조 |
| `--color-gold` | `#f59e0b` | 금색 강조, 카운터, REVERSE, 뱃지 |
| `--color-void` | `#0a0a1a` | 배경 기본 (뱃지 텍스트에도 사용) |

> WELCOME 화면 `.title`만 예외: **Cinzel Decorative, 400, 48px**

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
├── #modal-error             공통 - 에러 모달
└── #modal-card-zoom         공통 - 카드 줌 팝업
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
| 카드 덱 아이콘 | `.deck-icon` | 3장이 겹친 CSS 전용 카드 일러스트 + `.deck-canvas` 캔버스 |
| 메인 제목 | `.title` | "Creciel Tarot" — Cinzel Decorative, 400, 48px, `#fef3c7` (웰컴 화면 전용 폰트) |
| 부제목 | `.subtitle` | "카드가 당신의 길을 안내합니다" — Pretendard, italic, 24px, `#9333ea` |
| 설명 텍스트 | `.description` | "질문을 입력하고 카드를 뽑으면 / AI가 개인화된 해석을 제공합니다" — Pretendard, 16px, `#e2e8f0` |
| 시작 버튼 | `#btn-start-reading` | "무료 리딩 시작하기" — Pretendard, 700, 14px, uppercase, `#fef3c7` → SELECT_SPREAD 이동 |
| 면책 문구 | `.welcome-disclaimer` | "개인 정보를 수집 또는 이용하거나 / 별도의 비용을 요구하지 않습니다." — Pretendard, italic, 12px, `rgba(255,255,255,0.2)` (버튼 하단 80px) |

### 특이사항
- Critical CSS 인라인 처리: 외부 CSS 로드 전에도 정상 렌더링 보장
- 반응형: 768px → 32px 제목, 480px → 28px 제목
- 모바일 수직 중앙 정렬: `padding: max(20px, calc(50svh - 235px))`로 viewport 높이 기준 정렬

---

## 2. SELECT_SPREAD 화면 (`#screen-select-spread`)

**역할:** 리딩 방식(스프레드) 선택. 3종 카드 슬라이더.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 제목 | `h2` | "어떤 리딩을 원하십니까?" — Noto Serif KR, 700, 48px, `#fef3c7` |
| 부제목 | `.spread-subtitle` | "다음 4가지 옵션 중 / 하나를 골라 눌러주세요 / …" — Pretendard, 14px, `#fef3c7` ("24시간 제한" `#f59e0b` gold 강조) |
| 슬라이더 래퍼 | `#spread-slider-wrapper` | 카드 4장 감싸는 슬라이더 컨테이너 |
| 슬라이더 트랙 | `#spread-slider-track` | 실제 슬라이드가 나열되는 영역 |
| 원 카드 슬라이드 | `.spread-slide[data-spread="one"]` | **All-Seeing Eye SVG** 아이콘(gold `#f59e0b`), "원 카드" `.spread-card h3` — Pretendard, 20px, `#fef3c7` / "지금 이 순간" `.spread-desc` — Pretendard, 600, 14px, `#f59e0b` / 상세 설명 `.spread-detail` — Pretendard, 13px, `#e2e8f0` |
| 쓰리 카드 슬라이드 | `.spread-slide[data-spread="three"]` | **Triquetra SVG** 아이콘(gold), "쓰리 카드" / "과거, 현재 그리고 미래" / 상세 설명 (동일 스타일) |
| 켈틱 크로스 슬라이드 | `.spread-slide[data-spread="celtic"]` | **Ornate Celtic Cross SVG** 아이콘(gold), "켈틱 크로스" / "심층 분석" / 상세 설명 (동일 스타일) |
| 하트 소나 슬라이드 | `.spread-slide[data-spread="heart"]` | **Sonar Heart SVG** 아이콘(gold), "하트 소나" / "사랑의 울림" / "연애, 감정, 관계의 에너지를 / 7장의 카드로 면밀히 살펴봅니다" — `.locked` 클래스 고정(준비 중), 활성 glow 핑크(`#f472b6`) |
| 잠금 카운트다운 | `.spread-countdown` | "오늘/내일 N시 N분부터 가능" 또는 "준비 중입니다" — Pretendard, 600, 12px, `#f59e0b` |
| 페이지 도트 | `#spread-dots > .spread-dot` | 현재 슬라이드 인디케이터 4개 (모바일) |

### 기능
- **PC**: 4장 카드 나란히 그리드 배치, 클릭으로 선택
- **모바일**: 스택 카드 슬라이더, 터치 스와이프로 전환, 페이지 도트 클릭 가능
- **기본 슬라이드**: 화면 진입 시 잠금 상태 조회 후 자동 결정 — 쓰리 카드 우선, three 잠금 시 원 카드, 둘 다 잠금 시 켈틱 크로스
- **24시간 제한**: 잠긴 카드에 `.locked` 클래스 + `.spread-countdown` 해제 시각 표시
  - 표시 형식: "오늘/내일 오전/오후 N시 N분부터 가능" (+1분 보정 적용)
  - 1초마다 로컬 카운트다운, 만료 시 서버 재조회
- **잠금 카드**: 반투명 오버레이, `pointer-events: none` 클릭 차단
- 선택된 카드에 황금색 후광 펄싱 애니메이션 (`spreadGlow`)
- 이전 버튼 없음 (뒤로가기는 브라우저)

### 개발 모드
- `http://localhost:3000/dev` 접속 시 서버가 `<meta name="app-mode" content="dev">` 삽입 → `IS_DEV_MODE = true` → 잠금 UI 완전 비활성화
- `DEV_TOKEN` 환경변수 설정 시 `/dev?token=<값>` 으로만 접근 가능

---

## 3. INPUT_QUESTION 화면 (`#screen-input-question`)

**역할:** 질문 입력 (선택사항, 최대 200자).

> ⚠️ **원 카드 스프레드는 이 화면을 거치지 않습니다.** SELECT_SPREAD에서 원 카드 선택 시 바로 SHUFFLE로 진입하며, `question`은 빈 문자열로 처리됩니다. 이 화면은 3카드·켈틱 크로스 전용입니다.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 제목 | `h2` | "마음 속 고민은 무엇인가요?" — Noto Serif KR, 700, 48px, `#fef3c7` |
| 안내 텍스트 | `.question-hint` | "하나의 주제에 대해 / …" — Pretendard, 14px, `#fef3c7` ("선택사항" `#f59e0b` gold 강조) |
| 텍스트에어리어 | `#input-question-text` | rows=4, maxlength=200 — Pretendard, 16px, `#e2e8f0` (배경 `#1a1040`, placeholder `#4c1d95`) |
| 글자 수 카운터 | `.question-info > #char-count` | "N / 200" — Pretendard, 12px, `#e2e8f0`, 우측 정렬 |
| 이전 버튼 | `#btn-back-spread` | → SELECT_SPREAD 이동 — Pretendard, 600, 14px, uppercase, `#e2e8f0` |
| 다음 버튼 | `#btn-next-question` | → SHUFFLE 이동 — Pretendard, 600, 14px, uppercase, `#fef3c7` |

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
| 상단 고정 정보 | `.shuffle-info` | PC: `position: sticky; top: 0` / 모바일: `position: fixed; top: 0` |
| 메시지 | `#shuffle-message` | "그럼 카드를 선택해볼까요?" — Noto Serif KR, 700, 48px, `#fef3c7` |
| 부가 설명 | (인라인 `<p>`) | "카드들의 주파수를 느끼며 / 신중히 선택해주세요" — Pretendard, 기본, `#e2e8f0` |
| 선택 카운터 | `#shuffle-count` | "N / N" — Pretendard, 600, 16px, `#f59e0b` |
| 카드 그리드 | `#cards-grid` | 78장 `.card-back-item` 동적 생성 (★ 아이콘 40px, `#f59e0b`) |
| 이전 버튼 | `#btn-back-question` | → INPUT_QUESTION (3카드·켈틱) / → SELECT_SPREAD (원 카드), selectedCards 초기화 — Pretendard, 600, 14px, uppercase, `#e2e8f0` |
| 선택 완료 버튼 | `#btn-cards-selected` | 선택 완료 전 `disabled`, → CARD_REVEAL — Pretendard, 600, 14px, uppercase, `#fef3c7` |

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
- 스프레드별 필요 카드 수: `one=1` / `three=3` / `celtic=10` / `heart=7`
- **모바일 버튼 핀**: `IntersectionObserver`로 마지막 카드 가시성 감지 → 버튼 자동 고정/해제 (`is-pinned`)
  - `is-pinned` 상태: `position: fixed; bottom: 0` + `cardsGrid`에 `paddingBottom` 보정
  - 데스크탑(769px 이상)에서는 버튼 핀 동작 없음 (레이아웃 변경 없음)
- 정방향/역방향 50% 랜덤 결정 (선택 시점)
- 반응형: 768px→9열, 600px→7열, 480px→6열

---

## 5. CARD_REVEAL 화면 (`#screen-card-reveal`)

**역할:** 선택한 카드를 순차 플립 후 해석 로딩.

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 카드 표시 영역 | `#cards-display` | 스프레드 클래스 동적 부여 (`spread-one` / `spread-three` / `spread-celtic` / `spread-heart`) |
| 카드 아이템 | `.card-item` | 각 카드 플립 컨테이너 |
| 클라리파이어 선택 | `#clarifier-before-reading` | 오라클 전 추가 카드 선택 UI (조건 충족 시만 표시) |
| 로딩 상태 | `#loading-state` | 클라리파이어 선택 완료 후 `.active` 클래스 부여 |
| 오라클 구체 | `.oracle-canvas` | Canvas 2D 수정구슬 애니메이션 (200×200px) |
| 로딩 텍스트 | `.loading-text` | 스프레드별 소요시간 안내 — Pretendard, 16px, `#e2e8f0` |
| 해석 요청 버튼 | `#btn-get-reading` | 현재 자동 호출로 `display:none` 상태 |

### 카드 아이템 구조 (`.card-item`)
```
.card-item
└── .card-container
    ├── .card-position-label   위치 레이블 — Pretendard, 600, 12px, `#fef3c7` (쓰리 카드: 가운데, 켈틱: 상단)
    └── .card-inner            3D 플립 컨테이너
        ├── .card-back         초기 표시 (별 아이콘 뒷면)
        └── .card-front        플립 후 표시 (카드 이미지 + 카드 정보)
            ├── .card-image    역방향 시 scaleY(-1)
            ├── .card-direction  "Reverse" — Pretendard, uppercase, 12px, `#f59e0b`
            └── .card-name     카드 이름 (한글) — Pretendard, 600, 18px, `#fef3c7`
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
- **하트 소나**: 6열 CSS 배치, 2-2-3 행 구성
  - 1행: 1번(col 1-3), 2번(col 4-6) / 2행: 3번(col 1-3), 4번(col 4-6) / 3행: 5번(col 1-2), 6번(col 3-4), 7번(col 5-6)

### 클라리파이어 추가 카드 선택 (`#clarifier-before-reading`)

카드 플립 완료 후, 오라클 구체 실행 전에 조건 충족 시 표시됩니다.

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 전체 섹션 | `#clarifier-before-reading` | 초기 `display:none`, 조건 충족 시 표시 |
| 제목 | `#clarifier-pre-title` | "✦ 추가 카드 N장을 뽑아볼까요?" — Pretendard, 기본, 기본크기, `#38bdf8` (sky-400) |
| 이유 텍스트 | `#clarifier-pre-reason` | 조건별 안내 문구 — Pretendard, 기본, `#e2e8f0`, 가운데 정렬 (`\n` → `<br>`) |
| 카드 그리드 | `#clarifier-pre-grid` | 원래 선택 카드 제외한 나머지 `.card-back-item` |
| 선택 완료 버튼 | `#btn-clarifier-pre-confirm` | 선택 전 `disabled` → 클릭 시 오라클 시작 |

**활성화 조건 (클라이언트 전용, 켈틱 크로스 비허용):**
| 조건 | 발동 | 카드 수 |
|------|------|---------|
| A. 비교/선택 질문 | 정규식: `둘 중`, `어느 쪽`, `아니면`, `vs` 등 | 2장 |
| B. 원 카드 역방향 | `spread=one && isReversed=true` | 1장 |
| D. 역방향 과반수 | 선택 카드 중 역방향 >50% (원 카드 제외) | 1장 |

- 우선순위: A > B > D
- 건너뛰기 없음 — 조건 발동 시 반드시 카드 선택 후 진행

### 로딩 메시지 (스프레드별)
| 스프레드 | 메시지 |
|----------|--------|
| 원 카드 | "최대 20초 정도 걸려요" |
| 쓰리 카드 | "최대 30초 정도 걸려요" |
| 켈틱 크로스 | "최대 40초 정도 걸려요" |
| 하트 소나 | "최대 40초 정도 걸려요" |

---

## 6. READING 화면 (`#screen-reading`)

**역할:** AI 해석 결과 표시. 3열 레이아웃 (좌카드 | 중해석 | 우카드).

### 구성요소

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 카드 컨테이너 | `.cards-summary-wrapper` | 좌우 카드 컬럼 감싸는 래퍼 |
| 좌측 카드 컬럼 | `#cards-summary-left` | allCards[0~4] 표시 (원래 카드 + 클라리파이어 카드 통합, PC: `position:fixed`) |
| 우측 카드 컬럼 | `#cards-summary-right` | allCards[5~] 표시 (PC: `position:fixed`) |
| 해석 중앙 래퍼 | `.reading-content-wrapper` | 질문박스 + 해석텍스트 + 안내문구 + 버튼 |
| 질문 박스 | `#reading-question` | 질문 있을 때만 표시, 파란 테두리 |
| 질문 레이블 | `.reading-question-label` | "💬 질문" — Pretendard, 700, 11px, uppercase, `#64b5f6` |
| 질문 텍스트 | `#reading-question-text` | 사용자 입력 질문 — Pretendard, 기본, 15px, `#e2e8f0` |
| 해석 컨텐츠 | `.reading-content` | marked.js 마크다운 렌더링 영역 |
| 해석 텍스트 | `#reading-text` | Claude AI 응답 — Pretendard, 기본, 15px, `#e2e8f0` |
| 스크린샷 안내 | `.reading-screenshot-notice` | "해석 결과를 다시 볼 수 없어요. 스크린샷을 해주세요." — Pretendard, 13px, `#e2e8f0`, opacity 0.7 |
| 처음으로 버튼 | `#btn-home` | 모든 상태 초기화 → WELCOME — Pretendard, 600, 14px, uppercase, `#fef3c7` |

### 카드 요약 아이템 (`.card-summary-wrap`)
```
.card-summary-wrap  (클릭 시 카드 줌 팝업 오픈, data-card-idx / data-is-clarifier 보유)
├── .card-summary-item        카드 이미지 영역
│   ├── .csm-bg-image         카드 이미지 (z-index:0, 역방향: scaleY(-1))
│   ├── .csm-overlay          반투명 오버레이 (z-index:1, 켈틱 크로스 제외)
│   ├── .card-number-badge    번호 뱃지 (z-index:2, 켈틱 크로스 1~10 / 하트 소나 1~7)
│   ├── .clarifier-badge      '+' 뱃지 (z-index:2, 클라리파이어 카드만, sky-400 #38bdf8, 우측 상단)
│   └── .csm-card-info        카드 이름/방향 (카드 하단 오버레이)
│       ├── .csm-direction    "REVERSE" — Pretendard, 700, 11px, uppercase, `#f59e0b`
│       └── .csm-name         카드 영문명 — Pretendard, 600, 12px, `#fef3c7`
└── .csm-position-label       위치 레이블 — Pretendard, 600, 10px, `#fef3c7`, opacity 0.85 (카드 아래, 1카드·클라리파이어 카드 제외)
```

- 원래 카드 + 클라리파이어 카드 모두 `allCards` 배열로 통합 렌더링
- 클라리파이어 카드는 목록 맨 오른쪽에 위치 (`data-is-clarifier="1"`)

---

### 모바일 카드 목록 자동 스크롤
- 해석 화면 진입 0.6초 후 `startCardListHintScroll()` 실행
- `.cards-summary-wrapper` scrollLeft: 0 → 끝(8초) → 2초 대기 → 0(8초)
- 터치·클릭 시 즉시 취소 / 스크롤 여백 ≤20px이면 실행 안 함

### 하트 소나 포지션 레이블 (7장)
| 번호 | 포지션 |
|------|--------|
| 1 | 나의 현재 감정 |
| 2 | 상대방의 현재 감정 |
| 3 | 관계의 장애물 |
| 4 | 관계의 핵심 |
| 5 | 가능성 / 기회 |
| 6 | 나에게 주는 조언 |
| 7 | 결과 / 앞으로의 방향 |

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
- 마크다운 요소 폰트:
  - `h1` — Pretendard, 22px, `#fef3c7`
  - `h2` — Pretendard, 18px, `#fef3c7`
  - `h3` — Pretendard, 15px, `#fef3c7`
  - `strong` — Pretendard, 700, 기본크기, `#f59e0b`
  - `em` — Pretendard, italic, 기본크기, `#c4b5fd`
  - `p`, `li` — Pretendard, 15px, `#e2e8f0`

---

## 공통 - 에러 모달 (`#modal-error`)

**역할:** API 오류, 사용 제한 초과 등 모든 에러 표시.

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 모달 오버레이 | `#modal-error.modal` | 활성화: `.modal.active` |
| 제목 | `h3` | "오류가 발생했습니다" — Pretendard, 기본, 20px, `#fef3c7` |
| 에러 메시지 | `#error-message` | 동적으로 텍스트 주입 — Pretendard, 기본, 기본크기, `#e2e8f0` |
| 닫기 버튼 | `#btn-close-error` | 모달 비활성화 — Pretendard, 600, 14px, uppercase, `#fef3c7` |

---

## 공통 - 카드 줌 팝업 (`#modal-card-zoom`)

**역할:** READING 화면에서 카드 클릭 시 중앙 확대 팝업 표시.

| 요소 | ID / 클래스 | 설명 |
|------|-------------|------|
| 모달 오버레이 | `#modal-card-zoom.card-zoom-modal` | 활성화: `.card-zoom-modal.active`, 배경 클릭 시 닫힘 |
| 팝업 컨테이너 | `.card-zoom-popup` | `slideUp` 0.25s 진입 애니메이션 |
| 카드 이미지 영역 | `#card-zoom-card (.card-zoom-card-wrap)` | 240px 너비, 2.5:4 비율 |
| 카드 배경 이미지 | `.card-zoom-bg-image` | 역방향 시 `scaleY(-1)` |
| 번호 뱃지 | `.card-zoom-number-badge` | 켈틱 크로스만 표시 — Pretendard, 700, 20px, `#0a0a1a` (배경 `#f59e0b`) |
| 위치 레이블 | `.card-zoom-position-label` | 원 카드 제외, 쓰리 카드는 중앙 정렬 — Pretendard, 600, 12px, `rgba(224,213,255,0.72)` |
| 카드 정보 영역 | `#card-zoom-info (.card-zoom-card-info)` | 카드 아래 표시 |
| 키워드 | `.card-zoom-keywords` | 카드 keywords 배열 쉼표 구분 — Pretendard, 기본, 12px, `rgba(224,213,255,0.72)` |
| 방향 | `.card-zoom-direction` | 역방향 시 "REVERSE" — Pretendard, 700, 10px, uppercase, `#f59e0b` |
| 카드명 | `.card-zoom-name` | 한글 카드 이름 — Pretendard, 700, 15px, `#fef3c7` |
| 닫기 안내 | `.card-zoom-hint` | "카드를 다시 누르면 꺼집니다" — Pretendard, 기본, 12px, `rgba(255,255,255,0.42)` |

### 기능
- READING 화면 카드(`.card-summary-item`) 클릭 → `openCardZoom()` 호출
- 팝업 클릭(배경 포함) → `closeCardZoom()` 호출
- 모바일: `width: min(72vw, 240px)` 반응형

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
| 위치 레이블 | 없음 | 과거/현재/미래 (가운데) | 10위치 명칭 (상단) |
| 번호 뱃지 | 없음 | 없음 | 1~10 (READING 화면, 줌 팝업) |
| 오버레이 | 있음 | 있음 | 없음 |
| API max_tokens | 1024 (+600) | 2500 (+600) | 4000 |
| API 타임아웃 | 30초 | 45초 | 90초 |
| 로딩 안내 | 최대 20초 | 최대 30초 | 최대 40초 |
| 플립 순서 (모바일) | - | 좌→우 | 1,3,4,5,6,8,2,7,9,10 |
| 프롬프트 파일 | `prompts/one.md` | `prompts/three.md` | `prompts/celtic.md` |

> `+600`: 클라리파이어 카드 포함 시 max_tokens 추가 (최대 4096 상한)

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
