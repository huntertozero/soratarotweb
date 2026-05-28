const https = require('https');

const SPREAD_NAMES = { one: '원 카드', three: '쓰리 카드', celtic: '켈틱 크로스' };

// Claude Sonnet 4.6 단가 ($/1M tokens)
const PRICE_INPUT = 3.0;
const PRICE_OUTPUT = 15.0;

function parseUserAgent(ua) {
  if (!ua) return '알 수 없음';
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const device = mobile ? '모바일' : 'PC';
  let browser = '기타';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  return `${device} / ${browser}`;
}

function sendSlackNotification({ spread, question, cards, usage, responseTime, ip, userAgent, acceptLanguage, isDev }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const cardList = cards.map(c => `${c.nameKo}${c.isReversed ? ' (역)' : ''}`).join(', ');
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const tokenInfo = usage
    ? `토큰: 입력 ${usage.input_tokens.toLocaleString()} / 출력 ${usage.output_tokens.toLocaleString()}`
    : null;

  const costInfo = usage
    ? `비용: $${((usage.input_tokens * PRICE_INPUT + usage.output_tokens * PRICE_OUTPUT) / 1_000_000).toFixed(4)}`
    : null;

  const timeInfo = responseTime ? `응답: ${(responseTime / 1000).toFixed(1)}초` : null;

  const lang = acceptLanguage ? acceptLanguage.split(',')[0].trim() : null;
  const device = parseUserAgent(userAgent);

  const lines = [
    `🔮 *타로 리딩 요청*`,
    `*스프레드:* ${SPREAD_NAMES[spread]}`,
    question ? `*질문:* ${question}` : null,
    `*카드:* ${cardList}`,
    [tokenInfo, costInfo, timeInfo].filter(Boolean).join('  |  ') || null,
    [`접속: ${ip || '알 수 없음'}`, lang, device].filter(Boolean).join('  |  '),
    `*환경:* ${isDev ? '개발' : '프로덕션'}  |  *시각:* ${now}`,
  ].filter(Boolean).join('\n');

  const payload = JSON.stringify({ text: lines });
  const url = new URL(webhookUrl);

  const req = https.request({
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  });
  req.on('error', err => console.error('슬랙 알림 전송 실패:', err.message));
  req.write(payload);
  req.end();
}

module.exports = { sendSlackNotification };
