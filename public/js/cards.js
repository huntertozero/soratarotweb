// 카드 셔플 및 선택 로직

// Fisher-Yates 셔플 알고리즘
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 주어진 수의 카드를 무작위로 선택
function selectRandomCards(count) {
  const allCardIds = cardMeta.map(card => card.id);
  const shuffledIds = shuffleArray(allCardIds);
  const selectedIds = shuffledIds.slice(0, count);

  // 정방향/역방향 결정 (50/50)
  return selectedIds.map(id => ({
    id,
    isReversed: Math.random() < 0.5,
  }));
}

// 특정 스프레드의 카드 선택
function selectCardsForSpread(spread) {
  const spreadCardCounts = {
    one: 1,
    three: 3,
    celtic: 10,
  };

  const count = spreadCardCounts[spread];
  if (!count) {
    throw new Error(`알 수 없는 스프레드 타입: ${spread}`);
  }

  return selectRandomCards(count);
}

// 카드 메타 조회 (ID로)
function getCardInfo(cardId) {
  return cardMeta.find(card => card.id === cardId);
}
