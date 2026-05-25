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

        console.log('🎬 카드 플립 시작, Reverse:', cardElement.dataset.reversed);

        // 하이라이트 애니메이션 완료 후 이미지 표시
        const showImage = () => {
          console.log('✨ 이미지 표시 - animationend 발생');
          cardFront.style.opacity = '1';
          highlight.remove();
        };

        // 하이라이트 애니메이션 이벤트
        highlight.addEventListener('animationend', showImage, { once: true });

        // 타임아웃 폴백 (0.6초)
        setTimeout(() => {
          if (highlight.parentElement) {
            console.log('⏱️ 타임아웃 - 강제 이미지 표시');
            cardFront.style.opacity = '1';
            if (highlight.parentElement) highlight.remove();
          }
          resolve();
        }, 600);

        // 카드 플립 애니메이션 시작
        cardInner.classList.add('flipped');

        // 역방향 여부 확인
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

  // Position 텍스트 (상단 가운데 정렬, 주황색)
  const positionStyle = isReversed
    ? `color: var(--color-gold); font-size: 12px; position: absolute; bottom: 10px; top: auto; left: 0; right: 0; text-align: center; transform: rotateZ(180deg); z-index: 10;`
    : `color: var(--color-gold); font-size: 12px; position: absolute; top: 10px; left: 0; right: 0; text-align: center; z-index: 10;`;
  const frontStyle = !isReversed ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center;` : '';

  cardElement.innerHTML = `
    <div class="card-container">
      <!-- 카드 의미 텍스트 (플립 전후 항상 표시) -->
      ${position ? `<div style="${positionStyle}">${position}</div>` : ''}

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
