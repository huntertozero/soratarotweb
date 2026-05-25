// 클라이언트용 카드 메타데이터 (경량)
// 서버의 data/cards.js와 동기화 필요

const cardMeta = [
  // 메이저 아르카나
  { id: 0, nameKo: 'The Fool', imageFile: 'thefool.jpg' },
  { id: 1, nameKo: 'The Magician', imageFile: 'themagician.jpg' },
  { id: 2, nameKo: 'The High Priestess', imageFile: 'thehighpriestess.jpg' },
  { id: 3, nameKo: 'The Empress', imageFile: 'theempress.jpg' },
  { id: 4, nameKo: 'The Emperor', imageFile: 'theemperor.jpg' },
  { id: 5, nameKo: 'The Hierophant', imageFile: 'thehierophant.jpg' },
  { id: 6, nameKo: 'The Lovers', imageFile: 'thelovers.jpg' },
  { id: 7, nameKo: 'The Chariot', imageFile: 'thechariot.jpg' },
  { id: 8, nameKo: 'Strength', imageFile: 'strength.jpg' },
  { id: 9, nameKo: 'The Hermit', imageFile: 'thehermit.jpg' },
  { id: 10, nameKo: 'Wheel of Fortune', imageFile: 'wheeloffortune.jpg' },
  { id: 11, nameKo: 'Justice', imageFile: 'justice.jpg' },
  { id: 12, nameKo: 'The Hanged Man', imageFile: 'thehangedman.jpg' },
  { id: 13, nameKo: 'Death', imageFile: 'death.jpg' },
  { id: 14, nameKo: 'Temperance', imageFile: 'temperance.jpg' },
  { id: 15, nameKo: 'The Devil', imageFile: 'thedevil.jpg' },
  { id: 16, nameKo: 'The Tower', imageFile: 'thetower.jpg' },
  { id: 17, nameKo: 'The Star', imageFile: 'thestar.jpg' },
  { id: 18, nameKo: 'The Moon', imageFile: 'themoon.jpg' },
  { id: 19, nameKo: 'The Sun', imageFile: 'thesun.jpg' },
  { id: 20, nameKo: 'Judgement', imageFile: 'judgement.jpg' },
  { id: 21, nameKo: 'The World', imageFile: 'theworld.jpg' },

  // 마이너 아르카나: 지팡이
  { id: 22, nameKo: 'Ace of Wands', suit: 'wands', imageFile: 'aceofwands.jpg' },
  { id: 23, nameKo: 'Two of Wands', suit: 'wands', imageFile: 'wand2.jpg' },
  { id: 24, nameKo: 'Three of Wands', suit: 'wands', imageFile: 'wand3.jpg' },
  { id: 25, nameKo: 'Four of Wands', suit: 'wands', imageFile: 'wand4.jpg' },
  { id: 26, nameKo: 'Five of Wands', suit: 'wands', imageFile: 'wand5.jpg' },
  { id: 27, nameKo: 'Six of Wands', suit: 'wands', imageFile: 'wand6.jpg' },
  { id: 28, nameKo: 'Seven of Wands', suit: 'wands', imageFile: 'wand7.jpg' },
  { id: 29, nameKo: 'Eight of Wands', suit: 'wands', imageFile: 'wand8.jpg' },
  { id: 30, nameKo: 'Nine of Wands', suit: 'wands', imageFile: 'wand9.jpg' },
  { id: 31, nameKo: 'Ten of Wands', suit: 'wands', imageFile: 'wand10.jpg' },
  { id: 32, nameKo: 'Page of Wands', suit: 'wands', imageFile: 'pageofwands.jpg' },
  { id: 33, nameKo: 'Knight of Wands', suit: 'wands', imageFile: 'knightofwands.jpg' },
  { id: 34, nameKo: 'Queen of Wands', suit: 'wands', imageFile: 'queenofwands.jpg' },
  { id: 35, nameKo: 'King of Wands', suit: 'wands', imageFile: 'kingofwands.jpg' },

  // 마이너 아르카나: 잔
  { id: 36, nameKo: 'Ace of Cups', suit: 'cups', imageFile: 'aceofcups.jpg' },
  { id: 37, nameKo: 'Two of Cups', suit: 'cups', imageFile: 'cup2.jpg' },
  { id: 38, nameKo: 'Three of Cups', suit: 'cups', imageFile: 'cup3.jpg' },
  { id: 39, nameKo: 'Four of Cups', suit: 'cups', imageFile: 'cup4.jpg' },
  { id: 40, nameKo: 'Five of Cups', suit: 'cups', imageFile: 'cup5.jpg' },
  { id: 41, nameKo: 'Six of Cups', suit: 'cups', imageFile: 'cup6.jpg' },
  { id: 42, nameKo: 'Seven of Cups', suit: 'cups', imageFile: 'cup7.jpg' },
  { id: 43, nameKo: 'Eight of Cups', suit: 'cups', imageFile: 'cup8.jpg' },
  { id: 44, nameKo: 'Nine of Cups', suit: 'cups', imageFile: 'cup9.jpg' },
  { id: 45, nameKo: 'Ten of Cups', suit: 'cups', imageFile: 'cup10.jpg' },
  { id: 46, nameKo: 'Page of Cups', suit: 'cups', imageFile: 'pageofcups.jpg' },
  { id: 47, nameKo: 'Knight of Cups', suit: 'cups', imageFile: 'knightofcups.jpg' },
  { id: 48, nameKo: 'Queen of Cups', suit: 'cups', imageFile: 'queenofcups.jpg' },
  { id: 49, nameKo: 'King of Cups', suit: 'cups', imageFile: 'kingofcups.jpg' },

  // 마이너 아르카나: 칼
  { id: 50, nameKo: 'Ace of Swords', suit: 'swords', imageFile: 'aceofswords.jpg' },
  { id: 51, nameKo: 'Two of Swords', suit: 'swords', imageFile: 'sword2.jpg' },
  { id: 52, nameKo: 'Three of Swords', suit: 'swords', imageFile: 'sword3.jpg' },
  { id: 53, nameKo: 'Four of Swords', suit: 'swords', imageFile: 'sword4.jpg' },
  { id: 54, nameKo: 'Five of Swords', suit: 'swords', imageFile: 'sword5.jpg' },
  { id: 55, nameKo: 'Six of Swords', suit: 'swords', imageFile: 'sword6.jpg' },
  { id: 56, nameKo: 'Seven of Swords', suit: 'swords', imageFile: 'sword7.jpg' },
  { id: 57, nameKo: 'Eight of Swords', suit: 'swords', imageFile: 'sword8.jpg' },
  { id: 58, nameKo: 'Nine of Swords', suit: 'swords', imageFile: 'sword9.jpg' },
  { id: 59, nameKo: 'Ten of Swords', suit: 'swords', imageFile: 'sword10.jpg' },
  { id: 60, nameKo: 'Page of Swords', suit: 'swords', imageFile: 'pageofswords.jpg' },
  { id: 61, nameKo: 'Knight of Swords', suit: 'swords', imageFile: 'knightofswords.jpg' },
  { id: 62, nameKo: 'Queen of Swords', suit: 'swords', imageFile: 'queenofswords.jpg' },
  { id: 63, nameKo: 'King of Swords', suit: 'swords', imageFile: 'kingofswords.jpg' },

  // 마이너 아르카나: 동전
  { id: 64, nameKo: 'Ace of Pentacles', suit: 'pentacles', imageFile: 'aceofpentacles.jpg' },
  { id: 65, nameKo: 'Two of Pentacles', suit: 'pentacles', imageFile: 'pentacle2.jpg' },
  { id: 66, nameKo: 'Three of Pentacles', suit: 'pentacles', imageFile: 'pentacle3.jpg' },
  { id: 67, nameKo: 'Four of Pentacles', suit: 'pentacles', imageFile: 'pentacle4.jpg' },
  { id: 68, nameKo: 'Five of Pentacles', suit: 'pentacles', imageFile: 'pentacle5.jpg' },
  { id: 69, nameKo: 'Six of Pentacles', suit: 'pentacles', imageFile: 'pentacle6.jpg' },
  { id: 70, nameKo: 'Seven of Pentacles', suit: 'pentacles', imageFile: 'pentacle7.jpg' },
  { id: 71, nameKo: 'Eight of Pentacles', suit: 'pentacles', imageFile: 'pentacle8.jpg' },
  { id: 72, nameKo: 'Nine of Pentacles', suit: 'pentacles', imageFile: 'pentacle9.jpg' },
  { id: 73, nameKo: 'Ten of Pentacles', suit: 'pentacles', imageFile: 'pentacle10.jpg' },
  { id: 74, nameKo: 'Page of Pentacles', suit: 'pentacles', imageFile: 'pageofpentacles.jpg' },
  { id: 75, nameKo: 'Knight of Pentacles', suit: 'pentacles', imageFile: 'knightofpentacles.jpg' },
  { id: 76, nameKo: 'Queen of Pentacles', suit: 'pentacles', imageFile: 'queenofpentacles.jpg' },
  { id: 77, nameKo: 'King of Pentacles', suit: 'pentacles', imageFile: 'kingofpentacles.jpg' },
];

// 변수명으로 접근 가능하도록 (app.js에서 사용)
window.cardMeta = cardMeta;

// 유틸리티: ID로 카드 메타 조회
function getCardMetaById(id) {
  return cardMeta.find(card => card.id === id);
}
