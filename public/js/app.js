// 메인 애플리케이션 상태 및 로직

// ========== 상태 관리 ==========

const appState = {
  currentScreen: 'welcome',
  selectedSpread: null,
  question: '',
  selectedCards: [],
  reading: null,
};

// ========== 스프레드 사용 제한 ==========
const IS_DEV_MODE = window.TAROT_APP_MODE === 'dev';
let spreadLimitIntervalId = null;
let spreadLimitData = {};

// ========== READING 화면 레이아웃 동기화 핸들러 ==========
// displayReading() 재호출 시 리스너 누적 방지용
let _syncLayoutHandler = null;

// ========== 카드 선택 화면 버튼 핀 옵저버 ==========
// 모바일에서 마지막 카드가 뷰포트에 들어오면 버튼 고정, 나가면 해제
let _shuffleBtnObserver = null;

// ========== 스프레드 사용 제한 함수 ==========

function formatCountdown(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h >= 1) return `🔒 ${h}시간 ${m}분 후 사용 가능`;
  if (m >= 1) return `🔒 ${m}분 ${sec}초 후 사용 가능`;
  return `🔒 ${sec}초 후 사용 가능`;
}

async function fetchSpreadLimits() {
  if (IS_DEV_MODE) return; // 개발 모드: 제한 UI 완전 스킵
  try {
    const res = await fetch('/api/limits');
    if (!res.ok) return;
    spreadLimitData = await res.json();
    renderSpreadLimitUI();
  } catch (e) {
    console.warn('⚠️ 사용 제한 상태 조회 실패:', e);
  }
}

function renderSpreadLimitUI() {
  if (IS_DEV_MODE) return;
  const cards = document.querySelectorAll('.spread-card');
  let hasLocked = false;

  cards.forEach(card => {
    const spread = card.dataset.spread;
    if (!spread || !spreadLimitData[spread]) return;

    const { locked, remainingMs } = spreadLimitData[spread];

    if (locked && remainingMs > 0) {
      hasLocked = true;
      card.classList.add('locked');

      // 카운트다운 텍스트 요소: 없으면 생성, 있으면 갱신
      let el = card.querySelector('.spread-countdown');
      if (!el) {
        el = document.createElement('p');
        el.className = 'spread-countdown';
        card.appendChild(el);
      }
      el.textContent = formatCountdown(remainingMs);
      // 로컬 카운트다운: 1초씩 차감
      spreadLimitData[spread].remainingMs = Math.max(0, remainingMs - 1000);
    } else {
      card.classList.remove('locked');
      card.querySelector('.spread-countdown')?.remove();
      if (spreadLimitData[spread]) {
        spreadLimitData[spread] = { locked: false, remainingMs: 0 };
      }
    }
  });

  if (hasLocked) {
    // 잠긴 카드가 있을 때만 interval 실행 (중복 방지)
    if (!spreadLimitIntervalId) {
      spreadLimitIntervalId = setInterval(() => {
        const anyExpired = Object.values(spreadLimitData)
          .some(d => d.locked && d.remainingMs <= 0);
        if (anyExpired) {
          fetchSpreadLimits(); // 만료 시 서버 재조회로 정확성 보장
        } else {
          renderSpreadLimitUI();
        }
      }, 1000);
    }
  } else {
    if (spreadLimitIntervalId) {
      clearInterval(spreadLimitIntervalId);
      spreadLimitIntervalId = null;
    }
  }
}

// 마크다운을 HTML로 변환 (marked.js 사용)
function renderMarkdown(text) {
  if (!text) return '';
  // breaks: true → 단일 줄바꿈도 <br>로 처리 (한국어 프롬프트 출력에 적합)
  return marked.parse(text, { breaks: true });
}

// ========== 화면 관리 ==========

function showScreen(screenId) {
  // 모든 스크린 숨기기
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // 특정 스크린만 보이기
  const screen = document.getElementById(`screen-${screenId}`);
  if (screen) {
    screen.classList.add('active');
  }

  appState.currentScreen = screenId;

  window.scrollTo(0, 0);

  // 화면 전환 시 배경 파티클 폭발 효과
  if (window.ParticleSystem) {
    window.ParticleSystem.triggerScreenTransition(screenId);
  }

  // select-spread 화면 진입 시마다 잠금 상태 최신화
  if (screenId === 'select-spread') {
    fetchSpreadLimits();
  }
}

function showError(message) {
  const errorModal = document.getElementById('modal-error');
  const errorMessage = document.getElementById('error-message');
  if (errorModal && errorMessage) {
    errorMessage.textContent = message;
    errorModal.classList.add('active');
  }
}

function closeError() {
  const errorModal = document.getElementById('modal-error');
  if (errorModal) {
    errorModal.classList.remove('active');
  }
}

// ========== 이벤트 리스너 설정 ==========

function setupEventListeners() {
  // ========== WELCOME 화면 ==========
  const btnStartReading = document.getElementById('btn-start-reading');
  if (btnStartReading) {
    btnStartReading.addEventListener('click', () => {
      showScreen('select-spread');
    });
  }

  // ========== SELECT_SPREAD 화면 ==========
  const spreadCards = document.querySelectorAll('.spread-card');
  spreadCards.forEach(card => {
    card.addEventListener('click', () => {
      // CSS pointer-events:none 외 이중 방어
      if (card.classList.contains('locked')) return;
      const spread = card.dataset.spread;
      appState.selectedSpread = spread;
      showScreen('input-question');
    });
  });

  const btnBackWelcome = document.getElementById('btn-back-welcome');
  if (btnBackWelcome) {
    btnBackWelcome.addEventListener('click', () => {
      showScreen('welcome');
    });
  }

  // ========== INPUT_QUESTION 화면 ==========
  const inputQuestionText = document.getElementById('input-question-text');
  const charCount = document.getElementById('char-count');

  if (inputQuestionText && charCount) {
    inputQuestionText.addEventListener('input', () => {
      charCount.textContent = inputQuestionText.value.length;
      appState.question = inputQuestionText.value;
    });
  }

  const btnBackSpread = document.getElementById('btn-back-spread');
  if (btnBackSpread) {
    btnBackSpread.addEventListener('click', () => {
      showScreen('select-spread');
    });
  }

  const btnNextQuestion = document.getElementById('btn-next-question');
  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', () => {
      appState.question = inputQuestionText?.value || '';
      proceedToShuffle();
    });
  }

  // ========== SHUFFLE 화면 ==========
  const btnBackQuestion = document.getElementById('btn-back-question');
  if (btnBackQuestion) {
    btnBackQuestion.addEventListener('click', () => {
      appState.selectedCards = [];
      showScreen('input-question');
    });
  }

  const btnCardsSelected = document.getElementById('btn-cards-selected');
  if (btnCardsSelected) {
    btnCardsSelected.addEventListener('click', () => {
      proceedToCardReveal();
    });
  }

  // ========== CARD_REVEAL 화면 ==========
  const btnGetReading = document.getElementById('btn-get-reading');
  if (btnGetReading) {
    btnGetReading.addEventListener('click', () => {
      fetchReading();
    });
  }

  // ========== READING 화면 ==========
  const btnHome = document.getElementById('btn-home');
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      appState.selectedSpread = null;
      appState.selectedCards = [];
      appState.reading = null;
      appState.question = '';
      showScreen('welcome');
    });
  }

  // ========== 에러 모달 ==========
  const btnCloseError = document.getElementById('btn-close-error');
  if (btnCloseError) {
    btnCloseError.addEventListener('click', closeError);
  }
}

// ========== 플로우 제어 함수 ==========

function proceedToShuffle() {
  appState.selectedCards = [];
  showScreen('shuffle');
  createCardGrid();
  setupCardSelectionListeners();
  updateCardSelectionUI();
  setupShuffleButtonPin(); // 모바일: 마지막 카드 도달 시 버튼 고정
}

// 모바일 전용: 마지막 카드가 뷰포트에 들어오면 버튼 하단 고정, 나가면 해제
function setupShuffleButtonPin() {
  // 데스크탑(769px 이상)에서는 동작하지 않음
  if (window.innerWidth > 768) return;

  const cardsGrid = document.getElementById('cards-grid');
  const buttonGroup = document.querySelector('#screen-shuffle .button-group');
  if (!cardsGrid || !buttonGroup) return;

  // 이전 옵저버 정리
  if (_shuffleBtnObserver) {
    _shuffleBtnObserver.disconnect();
    _shuffleBtnObserver = null;
  }

  // 마지막 카드(78번째)를 감지 대상으로 설정
  const lastCard = cardsGrid.lastElementChild;
  if (!lastCard) return;

  _shuffleBtnObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // 마지막 카드가 화면에 보임 → 버튼 고정, 카드 그리드 하단 여백 추가
        buttonGroup.classList.add('is-pinned');
        cardsGrid.style.paddingBottom = 'calc(88px + env(safe-area-inset-bottom, 0px))';
      } else {
        // 마지막 카드가 화면 밖 → 버튼 해제, 여백 제거
        buttonGroup.classList.remove('is-pinned');
        cardsGrid.style.paddingBottom = '';
      }
    },
    { threshold: 0.1 } // 마지막 카드의 10%만 보여도 감지
  );

  _shuffleBtnObserver.observe(lastCard);
}

// SHUFFLE 화면: 78장 카드 그리드 생성
function createCardGrid() {
  const cardsGrid = document.getElementById('cards-grid');
  if (!cardsGrid) return;

  cardsGrid.innerHTML = '';

  // 78장의 카드 생성 (13×6 그리드)
  for (let i = 0; i < 78; i++) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card-back-item';
    cardElement.dataset.cardId = i;
    cardsGrid.appendChild(cardElement);
  }
}

// SHUFFLE 화면: 카드 선택 이벤트 설정
function setupCardSelectionListeners() {
  const cardItems = document.querySelectorAll('.card-back-item');
  const requiredCount = getCardCountForSpread(appState.selectedSpread);

  cardItems.forEach(item => {
    item.addEventListener('click', () => {
      const cardId = parseInt(item.dataset.cardId);
      const isSelected = appState.selectedCards.some(c => c.id === cardId);

      if (isSelected) {
        // 선택 해제 애니메이션
        item.classList.add('deselecting');
        // 선택 해제 시 지속 파티클 중지
        if (window.Effects) {
          window.Effects.stopSelectedCardParticles(item);
        }
        setTimeout(() => {
          item.classList.remove('deselecting');
          item.classList.remove('selected');
          // 해제 직후 hover 효과가 즉시 적용되어 카드가 올라간 채 멈추는 현상 방지
          item.classList.add('no-hover');
          setTimeout(() => item.classList.remove('no-hover'), 250);
        }, 400);
        appState.selectedCards = appState.selectedCards.filter(c => c.id !== cardId);
      } else if (appState.selectedCards.length < requiredCount) {
        // 선택 추가 애니메이션 + 스파크 효과
        item.classList.add('selecting');
        if (window.Effects) {
          window.Effects.triggerCardSpark(item);
          window.Effects.startSelectedCardParticles(item);
        }
        setTimeout(() => {
          item.classList.remove('selecting');
          item.classList.add('selected');
        }, 600);
        appState.selectedCards.push({
          id: cardId,
          isReversed: Math.random() > 0.5, // 정방향/역방향 랜덤
        });
      }

      updateCardSelectionUI();
    });
  });
}

// SHUFFLE 화면: UI 업데이트 (선택 개수, 버튼 활성화)
function updateCardSelectionUI() {
  const requiredCount = getCardCountForSpread(appState.selectedSpread);
  const currentCount = appState.selectedCards.length;
  const countDisplay = document.getElementById('shuffle-count');
  const btnCardsSelected = document.getElementById('btn-cards-selected');

  if (countDisplay) {
    countDisplay.textContent = `${currentCount} / ${requiredCount}`;
  }

  // 모든 카드 선택 완료 시 버튼 활성화
  if (btnCardsSelected) {
    btnCardsSelected.disabled = currentCount < requiredCount;
  }

  // 선택 완료 시 버튼 그룹 고정
  const buttonGroup = document.querySelector('#screen-shuffle .button-group');
  if (currentCount >= requiredCount && buttonGroup) {
    buttonGroup.classList.add('is-pinned');
  }

  // 선택 완료된 카드를 disabled 상태로 표시
  const cardItems = document.querySelectorAll('.card-back-item');
  cardItems.forEach(item => {
    const cardId = parseInt(item.dataset.cardId);
    const isSelected = appState.selectedCards.some(c => c.id === cardId);

    if (isSelected) {
      item.classList.add('selected');
      item.classList.remove('disabled');
    } else if (currentCount >= requiredCount) {
      item.classList.add('disabled');
    } else {
      item.classList.remove('disabled');
    }
  });
}

// 스프레드별 필요한 카드 개수 반환
function getCardCountForSpread(spread) {
  const cardCounts = {
    one: 1,
    three: 3,
    celtic: 10,
  };
  return cardCounts[spread] || 1;
}

async function proceedToCardReveal() {
  showScreen('card-reveal');

  // 사용자가 선택한 카드는 이미 appState.selectedCards에 있음

  // 스프레드별 위치 정보 (claudeService.js 포지션과 동일)
  const spreadPositions = {
    one: ['지금 이 순간'],
    three: ['과거', '현재', '미래'],
    celtic: [
      '현재 상황',
      '가로막는 것',
      '의식적 목표',
      '무의식적 기반',
      '먼 과거',
      '가까운 미래',
      '나의 태도',
      '외부 영향',
      '희망과 두려움',
      '최종 결과',
    ],
  };

  // 원 카드는 위치 레이블 미표시 (3장, 10장만 과거/현재/미래 등 표시)
  const positions = appState.selectedSpread === 'one'
    ? null
    : spreadPositions[appState.selectedSpread];

  // 카드 표시 및 플립
  await displayAndFlipCards(appState.selectedCards, positions);

  // 로딩 상태 표시 + 오라클 구체 시작
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.classList.add('active');
    if (window.Effects) window.Effects.startOracleAnimation();
  }

  // 자동으로 해석 요청
  setTimeout(() => {
    fetchReading();
  }, 1000);
}

async function fetchReading() {
  try {
    console.log('🔄 해석 요청 시작...');
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      // 스프레드별 로딩 메시지 설정
      const loadingMessages = {
        one:    '타로 마스터가 카드를 읽고 있어요. 최대 30초 정도 걸려요.',
        three:  '타로 마스터가 카드를 읽고 있어요. 최대 45초 정도 걸려요.',
        celtic: '타로 마스터가 카드를 읽고 있어요. 최대 1분 정도 걸려요.',
      };
      const msgEl = loadingState.querySelector('p');
      if (msgEl) {
        msgEl.textContent = loadingMessages[appState.selectedSpread] || loadingMessages.one;
      }
      loadingState.classList.add('active');
      if (window.Effects) window.Effects.startOracleAnimation();
      console.log('✅ 로딩 상태 활성화');
    }

    const requestBody = {
      spread: appState.selectedSpread,
      question: appState.question,
      cards: appState.selectedCards,
    };

    console.log('📤 API 요청:', requestBody);

    const response = await fetch('/api/reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 개발 모드일 때 서버 우회 헤더 추가
        ...(IS_DEV_MODE ? { 'X-Tarot-Dev': '1' } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      // 429: 24시간 사용 제한 초과
      if (response.status === 429) {
        showError(errorData.error || '24시간 사용 제한에 걸렸습니다.');
        fetchSpreadLimits(); // 잠금 UI 즉시 갱신
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
          loadingState.classList.remove('active');
          if (window.Effects) window.Effects.stopOracleAnimation();
        }
        return;
      }
      throw new Error(errorData.error || '타로 해석 요청 실패');
    }

    const data = await response.json();
    console.log('✅ 응답 데이터 수신:', data);

    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error('서버 응답에 cards 배열이 없습니다: ' + JSON.stringify(data));
    }

    console.log('✅ cards 수:', data.cards.length, '장');
    appState.reading = data.reading;

    // 로딩 상태 숨기기 + 오라클 구체 정지
    if (loadingState) {
      loadingState.classList.remove('active');
      if (window.Effects) window.Effects.stopOracleAnimation();
      console.log('✅ 로딩 상태 비활성화');
    }

    // READING 화면으로 이동
    console.log('🔄 displayReading 호출');
    displayReading(data);
  } catch (error) {
    console.error('❌ 해석 요청 오류:', error);
    showError(error.message || '타로 해석을 불러올 수 없습니다. 다시 시도해주세요.');

    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.classList.remove('active');
      if (window.Effects) window.Effects.stopOracleAnimation();
    }
  }
}

function displayReading(data) {
  console.log('🎨 displayReading 시작');

  // 스프레드별 위치 레이블 (claudeService.js 포지션과 동일)
  const spreadPositions = {
    one: ['지금 이 순간'],
    three: ['과거', '현재', '미래'],
    celtic: [
      '현재 상황',
      '가로막는 것',
      '의식적 목표',
      '무의식적 기반',
      '먼 과거',
      '가까운 미래',
      '나의 태도',
      '외부 영향',
      '희망과 두려움',
      '최종 결과',
    ],
  };
  const positions = spreadPositions[appState.selectedSpread] || [];
  console.log('✅ 포지션 레이블:', positions);

  // ---- 카드 HTML 렌더링 ----
  const cardsSummaryLeft = document.getElementById('cards-summary-left');
  const cardsSummaryRight = document.getElementById('cards-summary-right');
  console.log('🔍 카드 컨테이너:', cardsSummaryLeft, cardsSummaryRight);

  if (cardsSummaryLeft && cardsSummaryRight) {
    const leftCards = data.cards.slice(0, 5);
    const rightCards = data.cards.slice(5, 10);
    console.log('📋 leftCards:', leftCards.length, 'rightCards:', rightCards.length);

    // 단일 카드 렌더 함수
    // positionIndex: data.cards 전체 기준 인덱스 (positions[] 조회용)
    const renderCard = (card, positionIndex) => {
      const imageUrl = `/img/cards/${card.imageFile}`;
      const direction = card.isReversed ? 'REVERSE' : '';
      const posLabel = positions[positionIndex] || '';

      // 역방향: 이미지만 상하반전 (텍스트는 정상)
      const imgTransform = card.isReversed ? 'transform: scaleY(-1);' : '';

      // 켈틱 크로스일 때만 번호 뱃지 (1-based 표시)
      const isCeltic = appState.selectedSpread === 'celtic';
      const badgeHtml = isCeltic
        ? `<div class="card-number-badge">${positionIndex + 1}</div>`
        : '';

      return `
        <div class="card-summary-item ${card.isReversed ? 'reversed' : ''}">
          <!-- 카드 이미지 (배경) -->
          <div class="csm-bg-image" style="background-image: url('${imageUrl}'); ${imgTransform}"></div>
          <!-- 어두운 오버레이 -->
          <div class="csm-overlay"></div>
          ${badgeHtml}
          <!-- 위치 레이블 (1카드 제외, 3장=가운데, 켈틱=우측) -->
          ${posLabel && appState.selectedSpread !== 'one'
            ? `<div class="csm-position-label${appState.selectedSpread === 'three' ? ' csm-position-label--center' : ''}">${posLabel}</div>`
            : ''}
          <!-- 카드 이름 / REVERSE (하단) -->
          <div class="csm-card-info">
            <div class="csm-direction">${direction}</div>
            <div class="csm-name">${card.nameKo}</div>
          </div>
        </div>
      `;
    };

    try {
      cardsSummaryLeft.innerHTML = leftCards.map((c, i) => renderCard(c, i)).join('');
      cardsSummaryRight.innerHTML = rightCards.map((c, i) => renderCard(c, i + 5)).join('');
      console.log('✅ 카드 렌더링 완료');
    } catch (renderErr) {
      console.error('❌ 카드 렌더링 오류:', renderErr);
    }
  } else {
    console.warn('⚠️ 카드 컨테이너를 찾지 못함 - 계속 진행');
  }

  // ---- 질문 표시 ----
  const readingQuestion = document.getElementById('reading-question');
  const readingQuestionText = document.getElementById('reading-question-text');
  if (readingQuestion && readingQuestionText) {
    const question = appState.question && appState.question.trim();
    if (question) {
      readingQuestionText.textContent = question;
      readingQuestion.style.display = 'block';
    } else {
      readingQuestion.style.display = 'none';
    }
  }

  // ---- 해석 텍스트 렌더링 ----
  const readingText = document.getElementById('reading-text');
  console.log('🔍 reading-text 요소:', readingText);
  if (readingText) {
    try {
      readingText.innerHTML = renderMarkdown(data.reading);
      console.log('✅ 해석 텍스트 표시 완료');
    } catch (textErr) {
      console.error('❌ 텍스트 렌더링 오류:', textErr);
      readingText.textContent = data.reading || '';
    }
  }

  // ---- 화면 전환 (position: fixed 요소 계산은 이후에 해야 함) ----
  console.log('🔄 showScreen(reading) 호출 직전');
  showScreen('reading');
  console.log('✅ READING 화면 전환 완료');

  // ---- 위치·높이 동기화 (showScreen 이후에만 BoundingClientRect 값이 유효) ----
  const readingContentWrapper = document.querySelector('.reading-content-wrapper');

  // 기존 리스너 제거 (displayReading 재호출 시 누적 방지)
  if (_syncLayoutHandler) {
    window.removeEventListener('scroll', _syncLayoutHandler);
    window.removeEventListener('resize', _syncLayoutHandler);
    _syncLayoutHandler = null;
  }

  const syncLayout = () => {
    // 모바일(768px 이하): 인라인 스타일 초기화 후 CSS 미디어쿼리에 위임
    if (window.innerWidth <= 768) {
      [cardsSummaryLeft, cardsSummaryRight].forEach(el => {
        if (!el) return;
        el.style.top = '';
        el.style.left = '';
        el.style.right = '';
        el.style.height = '';
      });
      return;
    }

    if (!cardsSummaryLeft || !cardsSummaryRight || !readingContentWrapper) return;

    const rect = readingContentWrapper.getBoundingClientRect();
    if (rect.width === 0) return; // 아직 렌더링 안 됨

    const gap = 15;

    // 상단 위치
    const topOffset = rect.top + window.scrollY;
    cardsSummaryLeft.style.top = topOffset + 'px';
    cardsSummaryRight.style.top = topOffset + 'px';

    // 좌우 위치
    const leftW = cardsSummaryLeft.offsetWidth;
    cardsSummaryLeft.style.left = (rect.left - leftW - gap) + 'px';
    cardsSummaryRight.style.left = (rect.right + gap) + 'px';
    cardsSummaryRight.style.right = 'auto';

    // 높이 동기화: 해석 영역과 동일한 높이로 맞춤
    const contentH = readingContentWrapper.offsetHeight;
    cardsSummaryLeft.style.height = contentH + 'px';
    cardsSummaryRight.style.height = contentH + 'px';
  };

  // 핸들러 저장 (다음 호출 시 제거 가능하도록)
  _syncLayoutHandler = syncLayout;

  // requestAnimationFrame: 브라우저가 레이아웃을 계산한 직후 실행
  requestAnimationFrame(() => {
    syncLayout();
    // 폰트·이미지 로딩 완료 후 재조정
    setTimeout(syncLayout, 150);
    setTimeout(syncLayout, 400);
  });

  window.addEventListener('scroll', syncLayout);
  window.addEventListener('resize', syncLayout);
}

// 스프레드 슬라이더 초기화
function setupSpreadSlider() {
  let currentIndex = 0;
  const track = document.getElementById('spread-slider-track');
  const dots = document.querySelectorAll('.spread-dot');
  const prevBtn = document.getElementById('spread-prev');
  const nextBtn = document.getElementById('spread-next');

  if (!track) return;

  const slides = track.querySelectorAll('.spread-slide');

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
  });

  // 터치 스와이프
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  });

  goTo(0);
}

// ========== 초기화 ==========

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupSpreadSlider();
  fetchSpreadLimits(); // 초기 잠금 상태 조회 (IS_DEV_MODE면 즉시 return)
  showScreen('welcome');
});
