const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth');

const app = express();

// 미들웨어
app.use(helmet());        // 보안 헤더 자동 설정
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://tripfit-web.vercel.app',
    ],
    credentials: true,
}));          // 프론트엔드(React)에서 API 호출 허용
app.use(express.json());  // JSON 요청 파싱
app.use(cookieParser());

app.use('/auth', authRouter);

// 테스트용 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Tripfit 서버 작동 중!' });
});

module.exports = app;