// 메인 애플리케이션 상태 및 로직

// ========== 상태 관리 ==========

const appState = {
  currentScreen: 'welcome',
  selectedSpread: null,
  question: '',
  selectedCards: [],
  reading: null,
};

// 간단한 마크다운을 HTML로 변환
function simpleMarkdownToHtml(text) {
  if (!text) return '';

  return text
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(.+)$/gm, (match, line) => {
      if (
        line.startsWith('<h') ||
        line.startsWith('<p>') ||
        line.startsWith('<ul') ||
        line.startsWith('<ol') ||
        line.startsWith('</p>')
      ) {
        return match;
      }
      return '<p>' + line + '</p>';
    })
    .replace(/<\/p><p>/g, '</p><p>')
    .replace(/- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/(<\/li>)<li>/g, '$1<li>');
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

  const btnSkipQuestion = document.getElementById('btn-skip-question');
  if (btnSkipQuestion) {
    btnSkipQuestion.addEventListener('click', e => {
      e.preventDefault();
      appState.question = '';
      proceedToShuffle();
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
  const btnNewReading = document.getElementById('btn-new-reading');
  if (btnNewReading) {
    btnNewReading.addEventListener('click', () => {
      // 현재 스프레드로 다시 시작
      appState.selectedCards = [];
      appState.reading = null;
      appState.question = '';
      showScreen('shuffle');
    });
  }

  const btnChangeSpread = document.getElementById('btn-change-spread');
  if (btnChangeSpread) {
    btnChangeSpread.addEventListener('click', () => {
      appState.selectedSpread = null;
      appState.selectedCards = [];
      appState.reading = null;
      appState.question = '';
      showScreen('select-spread');
    });
  }

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
        setTimeout(() => {
          item.classList.remove('deselecting');
          item.classList.remove('selected');
        }, 400);
        appState.selectedCards = appState.selectedCards.filter(c => c.id !== cardId);
      } else if (appState.selectedCards.length < requiredCount) {
        // 선택 추가 애니메이션
        item.classList.add('selecting');
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

  // 스프레드별 위치 정보
  const spreadPositions = {
    one: ['현재'],
    three: ['과거', '현재', '미래'],
    celtic: [
      '현재',
      '도전',
      '원하는 결과',
      '심층 근원',
      '최근 과거',
      '가까운 미래',
      '당신의 입장',
      '주변 환경',
      '희망/두려움',
      '최종 결과',
    ],
  };

  const positions = spreadPositions[appState.selectedSpread];

  // 카드 표시 및 플립
  await displayAndFlipCards(appState.selectedCards, positions);

  // 로딩 상태 표시
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.classList.add('active');
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
      loadingState.classList.add('active');
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
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '타로 해석 요청 실패');
    }

    const data = await response.json();
    console.log('✅ 응답 데이터 수신:', data.cards.length, '장 카드');
    appState.reading = data.reading;

    // 로딩 상태 숨기기
    if (loadingState) {
      loadingState.classList.remove('active');
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
    }
  }
}

function displayReading(data) {
  console.log('🎨 displayReading 시작');

  // 카드 요약 표시 (좌우 분리)
  const cardsSummaryLeft = document.getElementById('cards-summary-left');
  const cardsSummaryRight = document.getElementById('cards-summary-right');
  const readingContentWrapper = document.querySelector('.reading-content-wrapper');
  console.log('🔍 cardsSummaryLeft, cardsSummaryRight 요소:', cardsSummaryLeft, cardsSummaryRight);

  if (cardsSummaryLeft && cardsSummaryRight) {
    try {
      const leftCards = data.cards.slice(0, 5);
      const rightCards = data.cards.slice(5, 10);

      const renderCard = (card) => {
        const imageUrl = `/img/cards/${card.imageFile}`;
        const direction = card.isReversed ? 'REVERSE' : '';
        const meaning = card.meaning || '';

        // 이미지 HTML (오버레이 포함)
        const imageHTML = `
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${imageUrl}'); background-size: cover; background-position: center; ${card.isReversed ? 'transform: scaleY(-1);' : ''}"></div>
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 1;"></div>
        `;

        // 텍스트 HTML
        const textHTML = `
          <div style="position: absolute; top: 10px; left: 0; right: 0; text-align: center; z-index: 2; color: var(--color-starlight); font-size: 11px; font-weight: 600; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.6);">
            ${meaning}
          </div>
          <div class="card-info" style="position: relative; z-index: 2;">
            <div class="card-direction">${direction}</div>
            <div class="card-name">${card.nameKo}</div>
          </div>
        `;

        return `
          <div class="card-summary-item ${card.isReversed ? 'reversed' : ''}">
            ${imageHTML}
            ${textHTML}
          </div>
        `;
      };

      cardsSummaryLeft.innerHTML = leftCards.map(renderCard).join('');
      cardsSummaryRight.innerHTML = rightCards.map(renderCard).join('');
      console.log('✅ 카드 요약 표시 완료');

      // 카드 위치를 읽기 영역과 동기화
      if (readingContentWrapper) {
        const syncCardPositions = () => {
          const wrapperRect = readingContentWrapper.getBoundingClientRect();
          const gap = 15; // 카드와 텍스트 사이의 간격

          // Top 위치: 읽기 영역 맨 위
          const topOffset = wrapperRect.top + window.scrollY;
          cardsSummaryLeft.style.top = topOffset + 'px';
          cardsSummaryRight.style.top = topOffset + 'px';

          // Left/Right 위치: 실제 컨테이너 너비 기반으로 계산
          const leftContainerWidth = cardsSummaryLeft.offsetWidth;
          const rightContainerWidth = cardsSummaryRight.offsetWidth;

          // 좌측: 해석 영역 왼쪽 - 카드 컨테이너 너비 - gap
          const leftPos = wrapperRect.left - leftContainerWidth - gap;
          cardsSummaryLeft.style.left = leftPos + 'px';

          // 우측: 해석 영역 오른쪽 + gap (left 속성 사용)
          const rightPos = wrapperRect.right + gap;
          cardsSummaryRight.style.left = rightPos + 'px';
          cardsSummaryRight.style.right = 'auto';
        };

        // 초기 로드 및 DOM 렌더링 후 재계산
        syncCardPositions();
        setTimeout(syncCardPositions, 50);
        window.addEventListener('load', syncCardPositions);
        window.addEventListener('scroll', syncCardPositions);
        window.addEventListener('resize', syncCardPositions);
      }
    } catch (e) {
      console.error('❌ 카드 요약 오류:', e);
    }
  }

  // 해석 텍스트 표시
  const readingText = document.getElementById('reading-text');
  console.log('🔍 readingText 요소:', readingText);

  if (readingText) {
    try {
      // 마크다운 변환 및 HTML 표시
      const htmlContent = simpleMarkdownToHtml(data.reading);
      readingText.innerHTML = htmlContent;
      console.log('✅ 해석 텍스트 표시 완료');
    } catch (e) {
      console.error('❌ 해석 텍스트 오류:', e);
    }
  }

  // READING 화면으로 이동
  console.log('🔄 READING 화면으로 이동');
  showScreen('reading');
  console.log('✅ 화면 전환 완료');
}

// ========== 초기화 ==========

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  showScreen('welcome');
});
