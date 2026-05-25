// 카드 플립 애니메이션 제어

// 단일 카드 플립 (delay 후 실행)
function flipCard(cardElement, delayMs = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      const cardInner = cardElement.querySelector('.card-inner');
      const cardFront = cardElement.querySelector('.card-front');

      if (cardInner) {
        // 하이라이트 바 애니메이션 추가
        const highlight = document.createElement('div');
        highlight.className = 'card-highlight';
        cardElement.appendChild(highlight);

        // 하이라이트 애니메이션 끝난 후 이미지 표시
        highlight.addEventListener('animationend', () => {
          console.log('🔆 하이라이트 애니메이션 종료, Reverse:', cardElement.dataset.reversed);
          if (cardFront) {
            cardFront.style.visibility = 'visible';
            console.log('✅ visibility 설정:', cardFront.style.visibility);
          }
          highlight.remove();
          resolve();
        }, { once: true });

        // 카드 플립 애니메이션 시작
        cardInner.classList.add('flipped');

        // 역방향 여부 확인 (data-reversed 속성 사용)
        if (cardElement.dataset.reversed === 'true') {
          cardInner.classList.add('reversed');
        }
      }
    }, delayMs);
  });
}

// 순차 카드 플립 (여러 카드를 순서대로)
async function flipCardsSequentially(cardElements, delayBetweenFlips = 500) {
  for (let i = 0; i < cardElements.length; i++) {
    await flipCard(cardElements[i], delayBetweenFlips * i);
  }
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

  // Reverse 카드는 이미지만 반전 (z-index와 opacity 명시)
  const frontStyle = isReversed
    ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center; transform: scaleY(-1); position: relative; z-index: 2;`
    : `background-image: url('${imageUrl}'); background-size: cover; background-position: center;`;

  // Position 텍스트도 Reverse 카드일 때 반전
  const positionStyle = isReversed
    ? `color: var(--color-silver); font-size: 12px; position: absolute; top: 10px; transform: scaleY(-1);`
    : `color: var(--color-silver); font-size: 12px; position: absolute; top: 10px;`;

  cardElement.innerHTML = `
    <div class="card-container">
      <div class="card-inner">
        <!-- 카드 앞면 (초기 상태, 카드 뒷면) -->
        <div class="card-back">
          ${position ? `<div style="${positionStyle}">${position}</div>` : ''}
        </div>

        <!-- 카드 뒷면 (플립 후, 카드 앞면) -->
        <div class="card-front" style="${frontStyle}">
          <div class="card-info">
            <div class="card-direction">${directionText}</div>
            <div class="card-name">${cardInfo.nameKo}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return cardElement;
}

// 여러 카드를 화면에 표시하고 플립
async function displayAndFlipCards(cardsData, positions = null) {
  console.log('🃏 displayAndFlipCards 시작:', cardsData.length, '장');

  const cardsDisplay = document.getElementById('cards-display');
  console.log('🔍 cardsDisplay 요소:', cardsDisplay);

  if (!cardsDisplay) {
    console.error('❌ cards-display 요소를 찾을 수 없습니다');
    return;
  }

  // 기존 카드 제거
  cardsDisplay.innerHTML = '';

  // spread별 클래스 추가 (레이아웃 제어용)
  const spreadClass = `spread-${appState.selectedSpread}`;
  cardsDisplay.className = spreadClass;
  console.log('✅ 기존 카드 제거, 클래스 추가:', spreadClass);

  // 카드 요소 생성
  const cardElements = [];
  cardsData.forEach((cardData, index) => {
    const position = positions ? positions[index] : null;
    const cardElement = createCardElement(cardData.id, cardData.isReversed, position);
    if (cardElement) {
      // 역방향 카드에 클래스 추가
      if (cardData.isReversed) {
        cardElement.classList.add('reversed');
      }
      cardsDisplay.appendChild(cardElement);
      cardElements.push(cardElement);
    }
  });
  console.log('✅ 카드 요소 생성 및 추가:', cardElements.length, '개');

  // 순차 플립 (500ms 간격)
  console.log('🔄 카드 플립 시작...');
  await flipCardsSequentially(cardElements, 500);
  console.log('✅ 카드 플립 완료');
}
