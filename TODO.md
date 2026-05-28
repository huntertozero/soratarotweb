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

### ~~3. 켈틱 크로스 해석 화면 — 상단 카드 텍스트 매우 작게~~ ✅ 완료
- `#screen-reading.spread-celtic` 스코프로 `.csm-name` 9px, `.csm-direction` 8px, `.csm-position-label` 8px 축소

### ~~4. 켈틱 크로스 해석 화면 — 상단 카드 영역 배경 투명화~~ ✅ 완료
- 모바일 `.cards-summary-wrapper`의 `background: var(--color-void)` → `transparent` 변경
- `renderCard()`에서 켈틱 크로스 해석 화면 한정으로 `.csm-overlay` 제거, 이미지 폴백 `background-color: transparent` 처리

### 5. 프롬프트 수정 — 질문 중심 해석 강화
- **목표**: 사용자가 입력한 질문에 더 집중한 해석 결과 출력
- **관련 파일**: `prompts/system.md`, `prompts/one.md`, `prompts/three.md`, `prompts/celtic.md`

### ~~6. 켈틱 크로스 카드 리빌 순서 PC/모바일 분기~~ ✅ 완료
- `window.innerWidth <= 768` 분기: 모바일은 레이아웃 순(1,3,4,5,6,8,2,7,9,10), PC는 순서대로(1~10)
- `flipOrderMap.celtic`: 모바일 `[0,2,3,4,5,7,1,6,8,9]` / PC `null` (순차 플립)
