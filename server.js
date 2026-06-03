require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// API 키 조기 검증
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY가 .env 파일에 설정되지 않았습니다.');
  console.error('   .env 파일을 생성하고 ANTHROPIC_API_KEY=sk-ant-api03-... 를 입력하세요.');
  process.exit(1);
}

// NODE_ENV 미설정 경고 (프로덕션에서 반드시 설정 필요)
if (!process.env.NODE_ENV) {
  console.warn('⚠️  NODE_ENV가 설정되지 않았습니다. 프로덕션 배포 시 NODE_ENV=production을 설정하세요.');
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const readingRouter = require('./routes/reading');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway 등 리버스 프록시 뒤에서 실제 클라이언트 IP를 정확히 추출
// Railway는 Edge → Load Balancer → 앱 2단계 구조이므로 true로 전체 체인 신뢰
app.set('trust proxy', true);

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

// CORS: 같은 서버(same-origin) 요청은 자동 허용, 추가 도메인은 ALLOWED_ORIGINS로 지정
// cors(fn) 형식으로 req에 접근해 Host 헤더와 Origin을 직접 비교
const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

const corsOptions = (req, callback) => {
  const origin = req.headers.origin;
  // origin 없음 = curl 또는 서버사이드 요청
  if (!origin) return callback(null, { origin: false, credentials: true });
  // 같은 서버에서 온 요청: Origin이 서버 자신의 Host와 일치
  const selfOrigin = `${req.protocol}://${req.get('host')}`;
  if (origin === selfOrigin || extraOrigins.includes(origin)) {
    return callback(null, { origin: true, credentials: true });
  }
  callback(new Error('CORS 정책에 의해 차단된 요청입니다.'));
};

// 빌드 버전: git 커밋 해시 우선, 없으면 타임스탬프로 폴백
// 배포마다 해시가 달라져 브라우저 캐시를 자동으로 무효화
function getBuildVersion() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString().trim();
    // 미커밋 변경이 있으면 타임스탬프 추가 → 브라우저 캐시 즉시 무효화
    const dirty = execSync('git status --porcelain', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString().trim();
    return dirty ? `${hash}-${Date.now().toString(36)}` : hash;
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

// 보안 헤더 (모든 응답에 적용)
// X-Content-Type-Options: MIME 스니핑 방지
// X-Frame-Options: 클릭재킹 방지
// CSP: 허용된 출처 외 리소스 로드 및 스크립트 실행 차단
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    // 모든 스크립트는 자체 서버에서 로드 (marked.js, DOMPurify 로컬 번들)
    "script-src 'self'",
    // 인라인 스타일(Critical CSS) + 외부 폰트 CSS
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    // Google Fonts 실제 폰트 파일
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    // 카드 이미지는 자체 서버만
    "img-src 'self' data:",
    // API 호출은 자체 서버만
    "connect-src 'self'",
    // iframe 완전 차단
    "frame-ancestors 'none'",
    // 플러그인 차단
    "object-src 'none'",
  ].join('; '));
  next();
});

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
app.use('/api', cors(corsOptions));
app.use('/api', apiLimiter);
app.use('/api/reading', readingLimiter);
app.use('/api', readingRouter);

// HTML 전송 헬퍼: 버전 주입된 HTML에 no-cache 헤더 설정
// dev 모드는 인라인 스크립트 대신 <meta> 태그로 전달 (CSP script-src 'unsafe-inline' 불필요)
function serveHtml(res, devMode = false) {
  let html = htmlTemplate;
  if (devMode) {
    html = html.replace(
      '<meta name="description"',
      '<meta name="app-mode" content="dev">\n  <meta name="description"'
    );
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.type('html').send(html);
}

// GET /dev → 개발용 진입점
// DEV_TOKEN 환경변수가 설정된 경우 ?token= 쿼리 파라미터로 인증 필요
app.get('/dev', (req, res) => {
  const devToken = process.env.DEV_TOKEN;
  if (devToken && req.query.token !== devToken) {
    return res.status(404).send('Not found');
  }
  serveHtml(res, true);
});

// /index.html 직접 접근 처리 (버전 주입된 HTML 제공)
app.get('/index.html', (req, res) => serveHtml(res));

// SPA fallback: 모든 비-API 경로를 index.html로
app.get('*', (req, res) => {
  serveHtml(res);
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  // CORS 에러는 403으로 처리
  if (err.message === 'CORS 정책에 의해 차단된 요청입니다.') {
    return res.status(403).json({ error: err.message });
  }
  console.error('❌ 서버 에러:', err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.'
  });
});

app.listen(PORT, () => {
  console.log(`✨ 타로 리딩 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🌐 http://localhost:${PORT}`);
});
