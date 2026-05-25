require('dotenv').config();

const express = require('express');
const path = require('path');

// API 키 조기 검증
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY가 .env 파일에 설정되지 않았습니다.');
  console.error('   .env 파일을 생성하고 ANTHROPIC_API_KEY=sk-ant-api03-... 를 입력하세요.');
  process.exit(1);
}

const readingRouter = require('./routes/reading');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트
app.use('/api', readingRouter);

// SPA fallback: 모든 비-API 경로를 index.html로 리다이렉트
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
