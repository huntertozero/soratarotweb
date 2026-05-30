// 메인 애플리케이션 상태 및 로직

// ========== 상수 ==========

const SPREAD_POSITIONS = {
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

// ========== 카드 주파수 떨림 효과 ==========
// 카드 선택 화면에서 선택되지 않은 카드들이 떨리는 효과
let _cardShiveringInterval = null;

// ========== 스프레드 사용 제한 함수 ==========

function formatCountdown(ms) {
  // +1분: 초 단위를 표시하지 않으므로, 실제 해제 시각보다 1분 여유 있게 표시
  const unlockTime = new Date(Date.now() + ms + 60 * 1000);
  unlockTime.setSeconds(0, 0);

  const todayMidnight = new Date();
  todayMidnight.setHours(24, 0, 0, 0);
  const dayLabel = unlockTime < todayMidnight ? '오늘' : '내일';

  const h = unlockTime.getHours();
  const m = unlockTime.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  const mStr = m > 0 ? ` ${m}분` : '';

  return `🔒 ${dayLabel} ${ampm} ${h12}시${mStr}부터 가능`;
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
  // SHUFFLE 화면 벗어날 때 떨림 효과 정리
  if (appState.currentScreen === 'shuffle' && screenId !== 'shuffle') {
    if (_cardShiveringInterval) {
      clearInterval(_cardShiveringInterval);
      _cardShiveringInterval = null;
    }
    // 모든 카드의 shivering 클래스 제거
    document.querySelectorAll('.card-back-item.shivering').forEach(item => {
      item.classList.remove('shivering');
    });
  }

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

  // 웰컴 화면 덱 아이콘 궤도 애니메이션 제어
  if (window.Effects) {
    if (screenId === 'welcome') {
      window.Effects.startDeckAnimation();
    } else {
      window.Effects.stopDeckAnimation();
    }
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
  startCardShiveringEffect(); // 카드 주파수 떨림 효과 시작
}

// 카드 주파수 떨림 효과: 선택되지 않은 카드들이 주기적으로 떨림
function startCardShiveringEffect() {
  // 기존 interval 정리
  if (_cardShiveringInterval) {
    clearInterval(_cardShiveringInterval);
  }

  _cardShiveringInterval = setInterval(() => {
    const cardItems = document.querySelectorAll('.card-back-item');
    const selectedIds = new Set(appState.selectedCards.map(c => c.id));

    // 모든 카드에서 shivering 제거
    cardItems.forEach(item => item.classList.remove('shivering'));

    // 선택되지 않은 카드 중 랜덤으로 1~2장에만 떨림 효과 추가
    const unselectedCards = Array.from(cardItems).filter(item => {
      const cardId = parseInt(item.dataset.cardId);
      return !selectedIds.has(cardId);
    });

    const count = Math.random() > 0.5 ? 2 : 1; // 1~2장만 떨림
    const shuffled = unselectedCards.sort(() => Math.random() - 0.5);

    for (let i = 0; i < count && i < shuffled.length; i++) {
      shuffled[i].classList.add('shivering');
    }
  }, 1000); // 1000ms(1초)마다 떨림 카드 변경
}

// 모바일 전용: 마지막 카드가 뷰포트에 들어오면 버튼 하단 고정, 나가면 해제
let _lastCardIntersecting = false; // 마지막 카드의 현재 가시성 상태 저장

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
      _lastCardIntersecting = entry.isIntersecting;
      updateShuffleButtonPin();
    },
    { threshold: 0.1 } // 마지막 카드의 10%만 보여도 감지
  );

  _shuffleBtnObserver.observe(lastCard);
}

// 버튼 고정 상태 업데이트 (선택 완료 여부 + 마지막 카드 가시성 고려)
function updateShuffleButtonPin() {
  const cardsGrid = document.getElementById('cards-grid');
  const buttonGroup = document.querySelector('#screen-shuffle .button-group');
  if (!cardsGrid || !buttonGroup) return;

  const requiredCount = getCardCountForSpread(appState.selectedSpread);
  const currentCount = appState.selectedCards.length;
  const isSelectionComplete = currentCount >= requiredCount;

  if (_lastCardIntersecting || isSelectionComplete) {
    // 마지막 카드가 화면에 보이거나 선택 완료 → 버튼 고정
    buttonGroup.classList.add('is-pinned');
    cardsGrid.style.paddingBottom = 'calc(88px + env(safe-area-inset-bottom, 0px))';
  } else {
    // 마지막 카드가 화면 밖이고 선택 미완료 → 버튼 해제
    buttonGroup.classList.remove('is-pinned');
    cardsGrid.style.paddingBottom = '';
  }
}

// SHUFFLE 화면: 78장 카드 그리드 생성
function createCardGrid() {
  const cardsGrid = document.getElementById('cards-grid');
  if (!cardsGrid) return;

  cardsGrid.innerHTML = '';

  // 78장의 카드 생성 (시각적 순서 랜덤화)
  const cardIds = shuffleArray(Array.from({ length: 78 }, (_, i) => i));
  for (const id of cardIds) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card-back-item';
    cardElement.dataset.cardId = id;
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
        setTimeout(() => {
          item.classList.remove('deselecting');
          item.classList.remove('selected');
          // 해제 직후 hover 효과가 즉시 적용되어 카드가 올라간 채 멈추는 현상 방지
          item.classList.add('no-hover');
          setTimeout(() => item.classList.remove('no-hover'), 250);
        }, 400);
        appState.selectedCards = appState.selectedCards.filter(c => c.id !== cardId);
      } else if (appState.selectedCards.length < requiredCount) {
        // 선택 추가 애니메이션 (파티클 효과 제거 - 성능 최적화)
        item.classList.add('selecting');
        setTimeout(() => {
          item.classList.remove('selecting');
          item.classList.add('selected');
        }, 300);
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

  // 선택 상태 변경 후 버튼 고정 상태 갱신 (모바일)
  updateShuffleButtonPin();
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

  // 원 카드는 위치 레이블 미표시 (3장, 10장만 과거/현재/미래 등 표시)
  const positions = appState.selectedSpread === 'one'
    ? null
    : SPREAD_POSITIONS[appState.selectedSpread];

  // 카드 표시 및 플립
  await displayAndFlipCards(appState.selectedCards, positions);

  // 로딩 상태 표시 + 오라클 구체 시작
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.classList.add('active');
    if (window.Effects) window.Effects.startOracleAnimation();
    // 켈틱 크로스만: 카드 10장으로 로딩 인디케이터가 화면 밖으로 밀려나므로 스크롤
    if (appState.selectedSpread === 'celtic') {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }

  // 자동으로 해석 요청
  setTimeout(() => {
    fetchReading();
  }, 1000);
}

async function fetchReading() {
  try {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      const loadingMessages = {
        one:    '타로 마스터가 카드를 읽고 있어요.<br>최대 20초 정도 걸려요.',
        three:  '타로 마스터가 카드를 읽고 있어요.<br>최대 30초 정도 걸려요.',
        celtic: '타로 마스터가 카드를 읽고 있어요.<br>최대 40초 정도 걸려요.',
      };
      const msgEl = loadingState.querySelector('p');
      if (msgEl) {
        msgEl.innerHTML = loadingMessages[appState.selectedSpread] || loadingMessages.one;
      }
      loadingState.classList.add('active');
      if (window.Effects) window.Effects.startOracleAnimation();
    }

    const requestBody = {
      spread: appState.selectedSpread,
      question: appState.question,
      cards: appState.selectedCards,
    };

    const response = await fetch('/api/reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(IS_DEV_MODE ? { 'X-Tarot-Dev': '1' } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // 429: 24시간 사용 제한 초과
      if (response.status === 429) {
        showError(errorData.error || '24시간 사용 제한에 걸렸습니다.');
        fetchSpreadLimits();
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

    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error('서버 응답에 cards 배열이 없습니다: ' + JSON.stringify(data));
    }

    appState.reading = data.reading;

    if (loadingState) {
      loadingState.classList.remove('active');
      if (window.Effects) window.Effects.stopOracleAnimation();
    }

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

function openCardZoom(card, positionIndex, posLabel) {
  const modal = document.getElementById('modal-card-zoom');
  const cardWrap = document.getElementById('card-zoom-card');
  if (!modal || !cardWrap) return;

  const imageUrl = `/img/cards/${card.imageFile}`;
  const imgTransform = card.isReversed ? 'transform: scaleY(-1);' : '';
  const isCeltic = appState.selectedSpread === 'celtic';

  const badgeHtml = isCeltic
    ? `<div class="card-zoom-number-badge">${positionIndex + 1}</div>`
    : '';

  const posLabelHtml = posLabel && appState.selectedSpread !== 'one'
    ? `<div class="card-zoom-position-label${appState.selectedSpread === 'three' ? ' card-zoom-position-label--center' : ''}">${posLabel}</div>`
    : '';

  const directionHtml = card.isReversed
    ? `<span class="card-zoom-direction">REVERSE</span>`
    : '';

  const keywordsText = Array.isArray(card.keywords)
    ? card.keywords.slice(0, 3).join(', ')
    : '';

  cardWrap.innerHTML = `
    <div class="card-zoom-bg-image" style="background-image: url('${imageUrl}'); ${imgTransform}"></div>
    ${badgeHtml}
    ${posLabelHtml}
    <div class="card-zoom-bottom-bar">
      <div class="card-zoom-info-row">
        ${directionHtml}
        <span class="card-zoom-name">${card.nameKo}</span>
      </div>
      ${keywordsText ? `<div class="card-zoom-keywords">${keywordsText}</div>` : ''}
    </div>
  `;

  modal.classList.add('active');
}

function closeCardZoom() {
  const modal = document.getElementById('modal-card-zoom');
  if (modal) modal.classList.remove('active');
}

function displayReading(data) {
  // 해석 화면에 스프레드 클래스 부여 (CSS 타게팅용)
  const screenReading = document.getElementById('screen-reading');
  if (screenReading) {
    screenReading.classList.remove('spread-one', 'spread-three', 'spread-celtic');
    screenReading.classList.add(`spread-${appState.selectedSpread}`);
  }

  const positions = SPREAD_POSITIONS[appState.selectedSpread] || [];

  // ---- 카드 HTML 렌더링 ----
  const cardsSummaryLeft = document.getElementById('cards-summary-left');
  const cardsSummaryRight = document.getElementById('cards-summary-right');

  if (cardsSummaryLeft && cardsSummaryRight) {
    const leftCards = data.cards.slice(0, 5);
    const rightCards = data.cards.slice(5, 10);

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

      // 켈틱 크로스 해석 화면: 오버레이 제거, 이미지 폴백 투명화
      const bgExtraStyle = isCeltic ? ' background-color: transparent;' : '';
      const overlayHtml = isCeltic ? '' : '<div class="csm-overlay"></div>';

      return `
        <div class="card-summary-item ${card.isReversed ? 'reversed' : ''}" data-card-idx="${positionIndex}">
          <!-- 카드 이미지 (배경) -->
          <div class="csm-bg-image" style="background-image: url('${imageUrl}'); ${imgTransform}${bgExtraStyle}"></div>
          <!-- 어두운 오버레이 (켈틱 크로스 해석 화면 제외) -->
          ${overlayHtml}
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

      // 카드 클릭 → 줌 팝업
      document.querySelectorAll('#screen-reading .card-summary-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.cardIdx, 10);
          openCardZoom(data.cards[idx], idx, positions[idx] || '');
        });
      });
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
  if (readingText) {
    try {
      readingText.innerHTML = renderMarkdown(data.reading);
    } catch (textErr) {
      console.error('❌ 텍스트 렌더링 오류:', textErr);
      readingText.textContent = data.reading || '';
    }
  }

  // ---- 화면 전환 (position: fixed 요소 계산은 이후에 해야 함) ----
  showScreen('reading');

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

// 스프레드 슬라이더 초기화 (모바일: 스택 카드, PC: 그리드)
function setupSpreadSlider() {
  const track = document.getElementById('spread-slider-track');
  const dots = document.querySelectorAll('.spread-dot');
  const wrapper = document.getElementById('spread-slider-wrapper');

  if (!track || !wrapper) return;

  const slides = track.querySelectorAll('.spread-slide');
  const totalSlides = slides.length;
  const isMobile = window.innerWidth <= 768;

  // 모바일에서만 스택 카드 효과 적용
  if (isMobile) {
    let currentIndex = 0;

    function updateStack() {
      slides.forEach((slide, i) => {
        const offset = (i - currentIndex + totalSlides) % totalSlides;
        const normalizedOffset = offset > 1 ? offset - totalSlides : offset;

        if (normalizedOffset === 0) {
          slide.style.transform = 'translateX(0) rotateY(0) scale(1)';
          slide.style.opacity = '1';
          slide.style.zIndex = 30;
          slide.classList.add('active');
        } else if (normalizedOffset === -1) {
          slide.style.transform = 'translateX(-100px) rotateY(28deg) scale(0.9)';
          slide.style.opacity = '0.4';
          slide.style.zIndex = 10;
          slide.classList.remove('active');
        } else if (normalizedOffset === 1) {
          slide.style.transform = 'translateX(100px) rotateY(-28deg) scale(0.9)';
          slide.style.opacity = '0.4';
          slide.style.zIndex = 10;
          slide.classList.remove('active');
        }
      });

      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function goTo(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      updateStack();
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
    });

    // 터치 스와이프
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    wrapper.addEventListener('touchmove', e => {
      e.preventDefault();
    }, { passive: false });
    wrapper.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });

    updateStack();
  }
}

// ========== 초기화 ==========

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupSpreadSlider();
  fetchSpreadLimits(); // 초기 잠금 상태 조회 (IS_DEV_MODE면 즉시 return)
  showScreen('welcome');

  // 카드 줌 팝업 닫기
  document.getElementById('modal-card-zoom')?.addEventListener('click', closeCardZoom);
});
