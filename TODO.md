# 할 일 목록

## 다음 세션 작업 예정

### 1. 카드 선택 화면 카드 위치 랜덤화
- **문제**: 카드 위치가 고정이라 같은 위치를 계속 선택하면 항상 같은 카드가 나옴
- **목표**: SHUFFLE 화면에서 78장 카드의 시각적 순서를 매번 섞어 랜덤성 부여
- **관련 파일**: `public/js/cards.js`, `public/js/app.js`

### 2. 켈틱 크로스 해석 화면 — 카드 번호 코너 리본 적용
- **현재**: 노란색 원형 뱃지 (`.card-number-badge`)
- **목표**: 코너 리본 스타일로 변경
- **관련 파일**: `public/css/style.css`, `public/js/app.js` (`displayReading()`)

### 3. 켈틱 크로스 해석 화면 — 상단 카드 텍스트 매우 작게
- **대상**: 카드 이름(`.csm-name`), Reverse(`.csm-direction`), 카드 의미(`.csm-position-label`)
- **관련 파일**: `public/css/style.css`

### 4. 켈틱 크로스 해석 화면 — 상단 카드 영역 배경 투명화
- **현재**: 검정색 배경
- **목표**: 투명 처리
- **관련 파일**: `public/css/style.css` (`.cards-summary-left`, `.cards-summary-right`)

### 5. 프롬프트 수정 — 질문 중심 해석 강화
- **목표**: 사용자가 입력한 질문에 더 집중한 해석 결과 출력
- **관련 파일**: `prompts/system.md`, `prompts/one.md`, `prompts/three.md`, `prompts/celtic.md`

### 6. 켈틱 크로스 카드 리빌 순서 PC/모바일 분기
- **PC**: 1→2→3→4→5→6→7→8→9→10 (순서대로)
- **모바일**: 1→3→4→5→6→8→2→7→9→10 (현재 유지)
- **관련 파일**: `public/js/animation.js` (`displayAndFlipCards()` 내 `flipOrderMap`)
- **구현 방향**: `window.innerWidth <= 768` 조건으로 분기
