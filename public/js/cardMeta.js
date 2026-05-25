// 클라이언트용 카드 메타데이터 (경량)
// 서버의 data/cards.js와 동기화 필요

const cardMeta = [
  // 메이저 아르카나
  { id: 0, nameKo: '광대', imageFile: '00-the-fool.jpg' },
  { id: 1, nameKo: '마술사', imageFile: '01-the-magician.jpg' },
  { id: 2, nameKo: '여사제', imageFile: '02-the-high-priestess.jpg' },
  { id: 3, nameKo: '황후', imageFile: '03-the-empress.jpg' },
  { id: 4, nameKo: '황제', imageFile: '04-the-emperor.jpg' },
  { id: 5, nameKo: '교황', imageFile: '05-the-hierophant.jpg' },
  { id: 6, nameKo: '연인', imageFile: '06-the-lovers.jpg' },
  { id: 7, nameKo: '전차', imageFile: '07-the-chariot.jpg' },
  { id: 8, nameKo: '힘', imageFile: '08-strength.jpg' },
  { id: 9, nameKo: '은자', imageFile: '09-the-hermit.jpg' },
  { id: 10, nameKo: '운명의 수레바퀴', imageFile: '10-wheel-of-fortune.jpg' },
  { id: 11, nameKo: '정의', imageFile: '11-justice.jpg' },
  { id: 12, nameKo: '교수형', imageFile: '12-the-hanged-man.jpg' },
  { id: 13, nameKo: '죽음', imageFile: '13-death.jpg' },
  { id: 14, nameKo: '절제', imageFile: '14-temperance.jpg' },
  { id: 15, nameKo: '악마', imageFile: '15-the-devil.jpg' },
  { id: 16, nameKo: '탑', imageFile: '16-the-tower.jpg' },
  { id: 17, nameKo: '별', imageFile: '17-the-star.jpg' },
  { id: 18, nameKo: '달', imageFile: '18-the-moon.jpg' },
  { id: 19, nameKo: '태양', imageFile: '19-the-sun.jpg' },
  { id: 20, nameKo: '심판', imageFile: '20-judgement.jpg' },
  { id: 21, nameKo: '세상', imageFile: '21-the-world.jpg' },

  // 마이너 아르카나: 지팡이
  { id: 22, nameKo: '지팡이 에이스', suit: 'wands', imageFile: '22-ace-of-wands.jpg' },
  { id: 23, nameKo: '지팡이 2', suit: 'wands', imageFile: '23-two-of-wands.jpg' },
  { id: 24, nameKo: '지팡이 3', suit: 'wands', imageFile: '24-three-of-wands.jpg' },
  { id: 25, nameKo: '지팡이 4', suit: 'wands', imageFile: '25-four-of-wands.jpg' },
  { id: 26, nameKo: '지팡이 5', suit: 'wands', imageFile: '26-five-of-wands.jpg' },
  { id: 27, nameKo: '지팡이 6', suit: 'wands', imageFile: '27-six-of-wands.jpg' },
  { id: 28, nameKo: '지팡이 7', suit: 'wands', imageFile: '28-seven-of-wands.jpg' },
  { id: 29, nameKo: '지팡이 8', suit: 'wands', imageFile: '29-eight-of-wands.jpg' },
  { id: 30, nameKo: '지팡이 9', suit: 'wands', imageFile: '30-nine-of-wands.jpg' },
  { id: 31, nameKo: '지팡이 10', suit: 'wands', imageFile: '31-ten-of-wands.jpg' },
  { id: 32, nameKo: '지팡이 페이지', suit: 'wands', imageFile: '32-page-of-wands.jpg' },
  { id: 33, nameKo: '지팡이 기사', suit: 'wands', imageFile: '33-knight-of-wands.jpg' },
  { id: 34, nameKo: '지팡이 퀸', suit: 'wands', imageFile: '34-queen-of-wands.jpg' },
  { id: 35, nameKo: '지팡이 킹', suit: 'wands', imageFile: '35-king-of-wands.jpg' },

  // 마이너 아르카나: 잔
  { id: 36, nameKo: '잔 에이스', suit: 'cups', imageFile: '36-ace-of-cups.jpg' },
  { id: 37, nameKo: '잔 2', suit: 'cups', imageFile: '37-two-of-cups.jpg' },
  { id: 38, nameKo: '잔 3', suit: 'cups', imageFile: '38-three-of-cups.jpg' },
  { id: 39, nameKo: '잔 4', suit: 'cups', imageFile: '39-four-of-cups.jpg' },
  { id: 40, nameKo: '잔 5', suit: 'cups', imageFile: '40-five-of-cups.jpg' },
  { id: 41, nameKo: '잔 6', suit: 'cups', imageFile: '41-six-of-cups.jpg' },
  { id: 42, nameKo: '잔 7', suit: 'cups', imageFile: '42-seven-of-cups.jpg' },
  { id: 43, nameKo: '잔 8', suit: 'cups', imageFile: '43-eight-of-cups.jpg' },
  { id: 44, nameKo: '잔 9', suit: 'cups', imageFile: '44-nine-of-cups.jpg' },
  { id: 45, nameKo: '잔 10', suit: 'cups', imageFile: '45-ten-of-cups.jpg' },
  { id: 46, nameKo: '잔 페이지', suit: 'cups', imageFile: '46-page-of-cups.jpg' },
  { id: 47, nameKo: '잔 기사', suit: 'cups', imageFile: '47-knight-of-cups.jpg' },
  { id: 48, nameKo: '잔 퀸', suit: 'cups', imageFile: '48-queen-of-cups.jpg' },
  { id: 49, nameKo: '잔 킹', suit: 'cups', imageFile: '49-king-of-cups.jpg' },

  // 마이너 아르카나: 칼
  { id: 50, nameKo: '칼 에이스', suit: 'swords', imageFile: '50-ace-of-swords.jpg' },
  { id: 51, nameKo: '칼 2', suit: 'swords', imageFile: '51-two-of-swords.jpg' },
  { id: 52, nameKo: '칼 3', suit: 'swords', imageFile: '52-three-of-swords.jpg' },
  { id: 53, nameKo: '칼 4', suit: 'swords', imageFile: '53-four-of-swords.jpg' },
  { id: 54, nameKo: '칼 5', suit: 'swords', imageFile: '54-five-of-swords.jpg' },
  { id: 55, nameKo: '칼 6', suit: 'swords', imageFile: '55-six-of-swords.jpg' },
  { id: 56, nameKo: '칼 7', suit: 'swords', imageFile: '56-seven-of-swords.jpg' },
  { id: 57, nameKo: '칼 8', suit: 'swords', imageFile: '57-eight-of-swords.jpg' },
  { id: 58, nameKo: '칼 9', suit: 'swords', imageFile: '58-nine-of-swords.jpg' },
  { id: 59, nameKo: '칼 10', suit: 'swords', imageFile: '59-ten-of-swords.jpg' },
  { id: 60, nameKo: '칼 페이지', suit: 'swords', imageFile: '60-page-of-swords.jpg' },
  { id: 61, nameKo: '칼 기사', suit: 'swords', imageFile: '61-knight-of-swords.jpg' },
  { id: 62, nameKo: '칼 퀸', suit: 'swords', imageFile: '62-queen-of-swords.jpg' },
  { id: 63, nameKo: '칼 킹', suit: 'swords', imageFile: '63-king-of-swords.jpg' },

  // 마이너 아르카나: 동전
  { id: 64, nameKo: '동전 에이스', suit: 'pentacles', imageFile: '64-ace-of-pentacles.jpg' },
  { id: 65, nameKo: '동전 2', suit: 'pentacles', imageFile: '65-two-of-pentacles.jpg' },
  { id: 66, nameKo: '동전 3', suit: 'pentacles', imageFile: '66-three-of-pentacles.jpg' },
  { id: 67, nameKo: '동전 4', suit: 'pentacles', imageFile: '67-four-of-pentacles.jpg' },
  { id: 68, nameKo: '동전 5', suit: 'pentacles', imageFile: '68-five-of-pentacles.jpg' },
  { id: 69, nameKo: '동전 6', suit: 'pentacles', imageFile: '69-six-of-pentacles.jpg' },
  { id: 70, nameKo: '동전 7', suit: 'pentacles', imageFile: '70-seven-of-pentacles.jpg' },
  { id: 71, nameKo: '동전 8', suit: 'pentacles', imageFile: '71-eight-of-pentacles.jpg' },
  { id: 72, nameKo: '동전 9', suit: 'pentacles', imageFile: '72-nine-of-pentacles.jpg' },
  { id: 73, nameKo: '동전 10', suit: 'pentacles', imageFile: '73-ten-of-pentacles.jpg' },
  { id: 74, nameKo: '동전 페이지', suit: 'pentacles', imageFile: '74-page-of-pentacles.jpg' },
  { id: 75, nameKo: '동전 기사', suit: 'pentacles', imageFile: '75-knight-of-pentacles.jpg' },
  { id: 76, nameKo: '동전 퀸', suit: 'pentacles', imageFile: '76-queen-of-pentacles.jpg' },
  { id: 77, nameKo: '동전 킹', suit: 'pentacles', imageFile: '77-king-of-pentacles.jpg' },
];

// 변수명으로 접근 가능하도록 (app.js에서 사용)
window.cardMeta = cardMeta;

// 유틸리티: ID로 카드 메타 조회
function getCardMetaById(id) {
  return cardMeta.find(card => card.id === id);
}

// 유틸리티: 모든 카드 조회
function getAllCardMeta() {
  return cardMeta;
}
