require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// API 키 조기 검증
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY가 .env 파일에 설정되지 않았습니다.');
  console.error('   .env 파일을 생성하고 ANTHROPIC_API_KEY=sk-ant-api03-... 를 입력하세요.');
  process.exit(1);
}

const readingRouter = require('./routes/reading');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway 등 리버스 프록시 뒤에서 실제 클라이언트 IP를 정확히 추출
app.set('trust proxy', 1);

// Rate Limiting: /api 전체 — IP당 1분에 20회 (일반 사용 패턴 상 절대 도달 불가)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
});

// Rate Limiting: /api/reading 전용 — IP당 1시간에 15회 (쿠키 우회 시에도 API 호출 자체 차단)
const readingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '리딩 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.' },
});

// 빌드 버전: git 커밋 해시 우선, 없으면 타임스탬프로 폴백
// 배포마다 해시가 달라져 브라우저 캐시를 자동으로 무효화
function getBuildVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString().trim();
  } catch {
    return Date.now().toString(36);
  }
}
const BUILD_VERSION = getBuildVersion();
console.log(`🔖 빌드 버전: ${BUILD_VERSION}`);

// index.html을 서버 시작 시 1회 읽어 JS/CSS 참조에 ?v= 버전 주입 (메모리 캐시)
const HTML_PATH = path.join(__dirname, 'public', 'index.html');
const htmlTemplate = fs.readFileSync(HTML_PATH, 'utf-8')
  .replace(/(\/(?:js|css)\/[^"?]+)"/g, `$1?v=${BUILD_VERSION}"`);

// 미들웨어
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 정적 파일 서빙: JS/CSS/이미지는 1년 캐시 (버전 쿼리스트링으로 배포마다 무효화)
// index.html은 별도 라우트에서 no-cache로 제공 (index: false)
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  setHeaders: (res, filePath) => {
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// API 라우트
app.use('/api', apiLimiter);
app.use('/api/reading', readingLimiter);
app.use('/api', readingRouter);

// HTML 전송 헬퍼: 버전 주입된 HTML에 no-cache 헤더 설정
function serveHtml(res, extraScript = '') {
  let html = htmlTemplate;
  if (extraScript) {
    html = html.replace('</head>', `  ${extraScript}\n</head>`);
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.type('html').send(html);
}

// GET /dev → 개발용 진입점 (24시간 제한 없음)
app.get('/dev', (req, res) => {
  serveHtml(res, '<script>window.TAROT_APP_MODE = "dev";</script>');
});

// /index.html 직접 접근 처리 (버전 주입된 HTML 제공)
app.get('/index.html', (req, res) => serveHtml(res));

// SPA fallback: 모든 비-API 경로를 index.html로
app.get('*', (req, res) => {
  serveHtml(res);
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ 서버 에러:', err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.'
  });
});

app.listen(PORT, () => {
  console.log(`✨ 타로 리딩 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🌐 http://localhost:${PORT}`);
});
