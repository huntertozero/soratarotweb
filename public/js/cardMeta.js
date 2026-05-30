// 클라이언트용 카드 메타데이터 (경량)
// 서버의 data/cards.js와 동기화 필요

const cardMeta = [
  // 메이저 아르카나
  { id: 0, nameKo: '바보', imageFile: 'thefool.jpg' },
  { id: 1, nameKo: '마술사', imageFile: 'themagician.jpg' },
  { id: 2, nameKo: '여사제', imageFile: 'thehighpriestess.jpg' },
  { id: 3, nameKo: '여황제', imageFile: 'theempress.jpg' },
  { id: 4, nameKo: '황제', imageFile: 'theemperor.jpg' },
  { id: 5, nameKo: '교황', imageFile: 'thehierophant.jpg' },
  { id: 6, nameKo: '연인', imageFile: 'thelovers.jpg' },
  { id: 7, nameKo: '전차', imageFile: 'thechariot.jpg' },
  { id: 8, nameKo: '힘', imageFile: 'strength.jpg' },
  { id: 9, nameKo: '은둔자', imageFile: 'thehermit.jpg' },
  { id: 10, nameKo: '운명의 수레바퀴', imageFile: 'wheeloffortune.jpg' },
  { id: 11, nameKo: '정의', imageFile: 'justice.jpg' },
  { id: 12, nameKo: '매달린 남자', imageFile: 'thehangedman.jpg' },
  { id: 13, nameKo: '죽음', imageFile: 'death.jpg' },
  { id: 14, nameKo: '절제', imageFile: 'temperance.jpg' },
  { id: 15, nameKo: '악마', imageFile: 'thedevil.jpg' },
  { id: 16, nameKo: '탑', imageFile: 'thetower.jpg' },
  { id: 17, nameKo: '별', imageFile: 'thestar.jpg' },
  { id: 18, nameKo: '달', imageFile: 'themoon.jpg' },
  { id: 19, nameKo: '태양', imageFile: 'thesun.jpg' },
  { id: 20, nameKo: '심판', imageFile: 'judgement.jpg' },
  { id: 21, nameKo: '세계', imageFile: 'theworld.jpg' },

  // 마이너 아르카나: 지팡이
  { id: 22, nameKo: '지팡이 에이스', suit: 'wands', imageFile: 'aceofwands.jpg' },
  { id: 23, nameKo: '지팡이 2', suit: 'wands', imageFile: 'wand2.jpg' },
  { id: 24, nameKo: '지팡이 3', suit: 'wands', imageFile: 'wand3.jpg' },
  { id: 25, nameKo: '지팡이 4', suit: 'wands', imageFile: 'wand4.jpg' },
  { id: 26, nameKo: '지팡이 5', suit: 'wands', imageFile: 'wand5.jpg' },
  { id: 27, nameKo: '지팡이 6', suit: 'wands', imageFile: 'wand6.jpg' },
  { id: 28, nameKo: '지팡이 7', suit: 'wands', imageFile: 'wand7.jpg' },
  { id: 29, nameKo: '지팡이 8', suit: 'wands', imageFile: 'wand8.jpg' },
  { id: 30, nameKo: '지팡이 9', suit: 'wands', imageFile: 'wand9.jpg' },
  { id: 31, nameKo: '지팡이 10', suit: 'wands', imageFile: 'wand10.jpg' },
  { id: 32, nameKo: '지팡이 페이지', suit: 'wands', imageFile: 'pageofwands.jpg' },
  { id: 33, nameKo: '지팡이 기사', suit: 'wands', imageFile: 'knightofwands.jpg' },
  { id: 34, nameKo: '지팡이 여왕', suit: 'wands', imageFile: 'queenofwands.jpg' },
  { id: 35, nameKo: '지팡이 왕', suit: 'wands', imageFile: 'kingofwands.jpg' },

  // 마이너 아르카나: 잔
  { id: 36, nameKo: '컵 에이스', suit: 'cups', imageFile: 'aceofcups.jpg' },
  { id: 37, nameKo: '컵 2', suit: 'cups', imageFile: 'cup2.jpg' },
  { id: 38, nameKo: '컵 3', suit: 'cups', imageFile: 'cup3.jpg' },
  { id: 39, nameKo: '컵 4', suit: 'cups', imageFile: 'cup4.jpg' },
  { id: 40, nameKo: '컵 5', suit: 'cups', imageFile: 'cup5.jpg' },
  { id: 41, nameKo: '컵 6', suit: 'cups', imageFile: 'cup6.jpg' },
  { id: 42, nameKo: '컵 7', suit: 'cups', imageFile: 'cup7.jpg' },
  { id: 43, nameKo: '컵 8', suit: 'cups', imageFile: 'cup8.jpg' },
  { id: 44, nameKo: '컵 9', suit: 'cups', imageFile: 'cup9.jpg' },
  { id: 45, nameKo: '컵 10', suit: 'cups', imageFile: 'cup10.jpg' },
  { id: 46, nameKo: '컵 페이지', suit: 'cups', imageFile: 'pageofcups.jpg' },
  { id: 47, nameKo: '컵 기사', suit: 'cups', imageFile: 'knightofcups.jpg' },
  { id: 48, nameKo: '컵 여왕', suit: 'cups', imageFile: 'queenofcups.jpg' },
  { id: 49, nameKo: '컵 왕', suit: 'cups', imageFile: 'kingofcups.jpg' },

  // 마이너 아르카나: 칼
  { id: 50, nameKo: '칼 에이스', suit: 'swords', imageFile: 'aceofswords.jpg' },
  { id: 51, nameKo: '칼 2', suit: 'swords', imageFile: 'sword2.jpg' },
  { id: 52, nameKo: '칼 3', suit: 'swords', imageFile: 'sword3.jpg' },
  { id: 53, nameKo: '칼 4', suit: 'swords', imageFile: 'sword4.jpg' },
  { id: 54, nameKo: '칼 5', suit: 'swords', imageFile: 'sword5.jpg' },
  { id: 55, nameKo: '칼 6', suit: 'swords', imageFile: 'sword6.jpg' },
  { id: 56, nameKo: '칼 7', suit: 'swords', imageFile: 'sword7.jpg' },
  { id: 57, nameKo: '칼 8', suit: 'swords', imageFile: 'sword8.jpg' },
  { id: 58, nameKo: '칼 9', suit: 'swords', imageFile: 'sword9.jpg' },
  { id: 59, nameKo: '칼 10', suit: 'swords', imageFile: 'sword10.jpg' },
  { id: 60, nameKo: '칼 페이지', suit: 'swords', imageFile: 'pageofswords.jpg' },
  { id: 61, nameKo: '칼 기사', suit: 'swords', imageFile: 'knightofswords.jpg' },
  { id: 62, nameKo: '칼 여왕', suit: 'swords', imageFile: 'queenofswords.jpg' },
  { id: 63, nameKo: '칼 왕', suit: 'swords', imageFile: 'kingofswords.jpg' },

  // 마이너 아르카나: 동전
  { id: 64, nameKo: '동전 에이스', suit: 'pentacles', imageFile: 'aceofpentacles.jpg' },
  { id: 65, nameKo: '동전 2', suit: 'pentacles', imageFile: 'pentacle2.jpg' },
  { id: 66, nameKo: '동전 3', suit: 'pentacles', imageFile: 'pentacle3.jpg' },
  { id: 67, nameKo: '동전 4', suit: 'pentacles', imageFile: 'pentacle4.jpg' },
  { id: 68, nameKo: '동전 5', suit: 'pentacles', imageFile: 'pentacle5.jpg' },
  { id: 69, nameKo: '동전 6', suit: 'pentacles', imageFile: 'pentacle6.jpg' },
  { id: 70, nameKo: '동전 7', suit: 'pentacles', imageFile: 'pentacle7.jpg' },
  { id: 71, nameKo: '동전 8', suit: 'pentacles', imageFile: 'pentacle8.jpg' },
  { id: 72, nameKo: '동전 9', suit: 'pentacles', imageFile: 'pentacle9.jpg' },
  { id: 73, nameKo: '동전 10', suit: 'pentacles', imageFile: 'pentacle10.jpg' },
  { id: 74, nameKo: '동전 페이지', suit: 'pentacles', imageFile: 'pageofpentacles.jpg' },
  { id: 75, nameKo: '동전 기사', suit: 'pentacles', imageFile: 'knightofpentacles.jpg' },
  { id: 76, nameKo: '동전 여왕', suit: 'pentacles', imageFile: 'queenofpentacles.jpg' },
  { id: 77, nameKo: '동전 왕', suit: 'pentacles', imageFile: 'kingofpentacles.jpg' },
];

// 변수명으로 접근 가능하도록 (app.js에서 사용)
window.cardMeta = cardMeta;

// 유틸리티: ID로 카드 메타 조회
function getCardMetaById(id) {
  return cardMeta.find(card => card.id === id);
}
