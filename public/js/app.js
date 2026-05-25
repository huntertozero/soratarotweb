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
  const btnRevealCards = document.getElementById('btn-reveal-cards');
  if (btnRevealCards) {
    btnRevealCards.addEventListener('click', () => {
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
  showScreen('shuffle');
  // 자동으로 3초 후 카드 공개 준비
  setTimeout(() => {
    const btn = document.getElementById('btn-reveal-cards');
    if (btn) {
      btn.style.display = 'block';
    }
  }, 3000);
}

async function proceedToCardReveal() {
  showScreen('card-reveal');

  // 카드 선택
  appState.selectedCards = selectCardsForSpread(appState.selectedSpread);

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
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.classList.add('active');
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
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '타로 해석 요청 실패');
    }

    const data = await response.json();
    appState.reading = data.reading;

    // 로딩 상태 숨기기
    if (loadingState) {
      loadingState.classList.remove('active');
    }

    // READING 화면으로 이동
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
  // 카드 요약 표시
  const cardsSummary = document.getElementById('cards-summary');
  if (cardsSummary) {
    cardsSummary.innerHTML = data.cards
      .map(card => {
        const direction = card.isReversed ? '역방향' : '정방향';
        return `
          <div class="card-summary-item">
            <div class="card-summary-name">${card.nameKo}</div>
            <div class="card-summary-direction">${direction}</div>
          </div>
        `;
      })
      .join('');
  }

  // 해석 텍스트 표시
  const readingText = document.getElementById('reading-text');
  if (readingText) {
    // 마크다운 변환 및 HTML 표시
    const htmlContent = simpleMarkdownToHtml(data.reading);
    readingText.innerHTML = htmlContent;
  }

  // READING 화면으로 이동
  showScreen('reading');
}

// ========== 초기화 ==========

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  showScreen('welcome');
});
