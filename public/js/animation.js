// 카드 플립 애니메이션 제어

// 단일 카드 플립 (delay 후 실행)
function flipCard(cardElement, delayMs = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      const cardInner = cardElement.querySelector('.card-inner');
      const cardFront = cardElement.querySelector('.card-front');

      if (cardInner && cardFront) {
        // 하이라이트 바 애니메이션 추가
        const highlight = document.createElement('div');
        highlight.className = 'card-highlight';
        cardElement.appendChild(highlight);

        // 하이라이트 애니메이션 완료 후 이미지 표시
        const showImage = () => {
          cardFront.style.opacity = '1';
          highlight.remove();
        };

        // 하이라이트 애니메이션 이벤트
        highlight.addEventListener('animationend', showImage, { once: true });

        // 타임아웃 폴백 (CSS transition 0.7s + 여유 50ms)
        setTimeout(() => {
          if (highlight.parentElement) {
            cardFront.style.opacity = '1';
            if (highlight.parentElement) highlight.remove();
          }
          resolve();
        }, 750);

        // 카드 플립 애니메이션 시작
        cardInner.classList.add('flipped');

        // 플립 Flash 효과: 카드 개별 적용, 켈틱 크로스(10장)는 강도 추가 낮춤
        if (window.Effects) {
          const totalCards = document.querySelectorAll('.card-item').length;
          window.Effects.triggerFlipFlash(cardElement, totalCards > 3 ? 0.11 : 0.28);
        }

        // 역방향 여부 확인
        if (cardElement.dataset.reversed === 'true') {
          cardInner.classList.add('reversed');
        }
      }
    }, delayMs);
  });
}

// 순차 카드 플립 (모든 카드 동시에 타이머 시작, 각자 stagger 딜레이로 순차 플립)
async function flipCardsSequentially(cardElements, delayBetweenFlips = 300) {
  // Promise.all로 병렬 실행: 누적 await 대기 없이 각 카드가 delayBetweenFlips * i 후 독립 플립
  const promises = cardElements.map((el, i) =>
    flipCard(el, delayBetweenFlips * i)
  );
  await Promise.all(promises);
}

// HTML 요소 생성: 카드 아이템
function createCardElement(cardId, isReversed, position = null) {
  const cardInfo = getCardMetaById(cardId);
  if (!cardInfo) {
    console.error(`카드 ID ${cardId}를 찾을 수 없습니다.`);
    return null;
  }

  const cardElement = document.createElement('div');
  cardElement.className = 'card-item';
  cardElement.dataset.reversed = isReversed;

  const directionText = isReversed ? 'Reverse' : '';
  const imageUrl = `/img/cards/${cardInfo.imageFile}`;

  // Reverse 카드: 이미지만 반전, 텍스트는 정상
  let frontHTML;
  if (isReversed) {
    frontHTML = `
      <div class="card-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; transform: scaleY(-1);"></div>
      <div class="card-info">
        <div class="card-direction">${directionText}</div>
        <div class="card-name">${cardInfo.nameKo}</div>
      </div>
    `;
  } else {
    frontHTML = `
      <div class="card-info">
        <div class="card-direction">${directionText}</div>
        <div class="card-name">${cardInfo.nameKo}</div>
      </div>
    `;
  }

  const positionClass = isReversed ? 'card-position-label card-position-label--reversed' : 'card-position-label';
  const frontStyle = !isReversed ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center;` : '';

  cardElement.innerHTML = `
    <div class="card-container">
      <!-- 카드 의미 텍스트 (플립 전후 항상 표시) -->
      ${position ? `<div class="${positionClass}">${position}</div>` : ''}

      <div class="card-inner">
        <!-- 카드 앞면 (초기 상태, 카드 뒷면) -->
        <div class="card-back">
        </div>

        <!-- 카드 뒷면 (플립 후, 카드 앞면) -->
        <div class="card-front" style="${frontStyle}">
          ${frontHTML}
        </div>
      </div>
    </div>
  `;

  return cardElement;
}

// 여러 카드를 화면에 표시하고 플립
async function displayAndFlipCards(cardsData, positions = null) {
  const cardsDisplay = document.getElementById('cards-display');
  if (!cardsDisplay) {
    console.error('❌ cards-display 요소를 찾을 수 없습니다');
    return;
  }

  // 기존 카드 제거
  cardsDisplay.innerHTML = '';

  // spread별 클래스 추가 (레이아웃 제어용)
  cardsDisplay.className = `spread-${appState.selectedSpread}`;

  // 카드 요소 생성
  const cardElements = [];
  cardsData.forEach((cardData, index) => {
    const position = positions ? positions[index] : null;
    const cardElement = createCardElement(cardData.id, cardData.isReversed, position);
    if (cardElement) {
      if (cardData.isReversed) {
        cardElement.classList.add('reversed');
      }
      cardsDisplay.appendChild(cardElement);
      cardElements.push(cardElement);
    }
  });

  // 켈틱 크로스: 모바일은 레이아웃 순(1,3,4,5,6,8,2,7,9,10), PC는 순서대로(1~10)
  const isMobile = window.innerWidth <= 768;
  const flipOrder = appState.selectedSpread === 'celtic' && isMobile
    ? [0, 2, 3, 4, 5, 7, 1, 6, 8, 9]
    : null;
  const flipElements = flipOrder
    ? flipOrder.map(i => cardElements[i])
    : cardElements;

  // 순차 플립 (500ms 간격)
  await flipCardsSequentially(flipElements, 500);
}
