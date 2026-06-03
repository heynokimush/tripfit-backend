const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// 미들웨어
app.use(helmet());        // 보안 헤더 자동 설정
app.use(cors());          // 프론트엔드(React)에서 API 호출 허용
app.use(express.json());  // JSON 요청 파싱

// 테스트용 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Tripfit 서버 작동 중!' });
});

module.exports = app;