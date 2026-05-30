# 타로 리딩 웹 애플리케이션 - 개발 가이드

## 프로젝트 개요

로컬 + Railway 배포용 AI 기반 타로 리딩 웹 앱.

- **스택**: Node.js/Express + HTML/CSS/JS (번들러 없음)
- **AI 모델**: Claude Sonnet 4.6
- **실행**: `npm start` / 개발용: `http://localhost:3000/dev` (24시간 제한 없음)

> 완료된 Phase 1~32 상세 이력 → **DONE.md** 참고

---

## 개발 규칙

- **코드 주석**: 한국어 (WHY가 불명확할 때만)
- **커밋**: 한국어, 파일/기능 완성 후 즉시 (배치 커밋 금지)
- **UI 텍스트**: 한국어 / **변수·함수명**: 영어
- **API 키**: `.env`에만, 프론트엔드 노출 금지
- **카드 데이터**: 서버 `data/cards.js` (78장 전체) / 클라이언트 `public/js/cardMeta.js` (경량)

---

## 현재 상태 (Phase 36 완료)

| 영역 | 완료 내용 |
|------|-----------|
| 백엔드 | Express API, 24시간 사용 제한(쿠키), 스프레드별 타임아웃/토큰 분리, 3카드 max_tokens 2500 |
| 프론트엔드 | 78장 선택(매 진입마다 위치 랜덤화), 카드 플립, READING 3열 레이아웃, marked.js 마크다운 |
| 애니메이션 | Canvas 파티클 배경, 오라클 구체 로딩, 카드 스파크/플래시, 웰컴 덱 아이콘 룬 궤도 |
| 모바일 | 반응형 레이아웃 전면 개선, 화면별 상단 여백 정렬, shuffle-info fixed 고정, 진입 애니메이션 버그 수정 |
| 프롬프트 | `prompts/*.md` 파일 분리, 이미지·역방향·연관성 원칙 포함 |
| UX | 켈틱 크로스 카드 번호 뱃지, 켈틱 로딩 자동 스크롤, 웰컴 subtitle 수직 중앙 정렬, 텍스트 전면 개선 |
| 코드 품질 | Dead code 제거, 중복 로직 정리, 디버그 로그 제거 |
| 배포 | `railway.toml` 생성, 캐시 버스팅(git 해시 `?v=`), JS/CSS 1년 캐시, HTML no-cache |
| 모니터링 | Slack Incoming Webhook 리딩 알림 (스프레드/질문/카드/토큰/비용/응답시간/접속정보) |
| 문서 | `SCREENS.md` 생성 및 Phase 35 기준 전면 업데이트 (카드 줌 팝업, 잠금 시각 표시 등), `README.md` 업데이트 |
| CSS | 질문 입력 화면 제목(`#screen-input-question h2`) PC 줄바꿈 방지 (`white-space: nowrap`) |
| UX | `.spread-countdown` 문구를 남은 시간 카운트다운 → 실제 해제 시각 표시로 변경 (`오늘/내일 오전/오후 N시 N분부터 가능`), +1분 보정 적용 |
| UX | 카드 줌 팝업: 해석 화면 카드 클릭 시 중앙 확대 팝업, 카드명·키워드·REVERSE 하단 표시, 켈틱 번호 뱃지 2× 스케일, 위치 레이블 표시, 재클릭 닫기 |
| 버그 수정 | SHUFFLE 화면 카드 선택 완료 시 데스크탑 하단 여백 늘어나는 버그 수정 (`updateShuffleButtonPin()`에 데스크탑 조기 반환 추가, `updateCardSelectionUI()` 중복 `is-pinned` 제거) |

---

## 파일별 책임

| 파일 | 역할 |
|------|------|
| `server.js` | Express 설정, `/dev` 진입점, cookieParser, 캐시 버스팅(git 해시 `?v=`), 에러 핸들러 |
| `data/cards.js` | 78장 카드 데이터 (id, nameKo, keywords, meaning, imageSymbols) |
| `data/cardImages.js` | 카드 ID → 이미지 파일명 매핑 |
| `routes/reading.js` | `GET/DELETE /api/limits`, `POST /api/reading` (24시간 제한 + 검증) |
| `prompts/*.md` | system / one / three / celtic — 서버 재시작 없이 즉시 반영 |
| `services/claudeService.js` | Claude API 호출 (스프레드별 max_tokens / timeout), `{ reading, usage }` 반환 |
| `services/slackService.js` | Slack Incoming Webhook 알림 (리딩 성공 시 비동기 전송) |
| `public/js/app.js` | 상태 관리, 화면 전환, API fetch |
| `public/js/animation.js` | 카드 플립, PC/모바일 순서 분기 |
| `public/js/effects.js` | 스파크, 지속 파티클, 플립 플래시, 오라클 캔버스 |
| `public/js/particles.js` | Canvas 별 파티클 배경, 오로라 blob |
| `public/js/cards.js` | Fisher-Yates 셔플 (`shuffleArray`) |
| `railway.toml` | Railway 배포 설정 (NIXPACKS, 헬스체크, 재시작 정책) |
| `public/js/cardMeta.js` | 클라이언트용 경량 카드 배열 (id, nameKo, suit, imageFile) |

---

## 테스트

```powershell
# API 단독 테스트
$body = @{ spread = "one"; question = "나의 길은?"; cards = @(@{ id = 0; isReversed = $false }) } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/reading" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body $body
```

UI: `npm start` → `http://localhost:3000/dev` (3가지 스프레드 각각 테스트)

---

## 문제 해결

- **API 키 오류** → `.env`의 `ANTHROPIC_API_KEY` 확인
- **READING 카드 이미지 안 보임** → 서버 재시작 필요 + `data/cardImages.js` 존재 확인
- **해석 화면 전환 안 됨** → F12 Console 확인 → 에러 모달 메시지 확인 → 서버 재시작

---

## 남은 작업

### ⭐ 우선순위 낮음

- 프리셋 질문 버튼, 리딩 히스토리(localStorage), 다크/라이트 테마, 카드 플립 효과음

---

## 참고

- 환경: Windows 11, Node.js v24.15.0
- 개발 진입점: `http://localhost:3000/dev` (24시간 제한 없음)
- 배포 진입점: `http://localhost:3000/` (제한 적용, Railway용)
