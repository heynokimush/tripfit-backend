require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/prisma');
const redis = require('./src/redis');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ DB 연결 성공!');

    // Redis 테스트
    await redis.set('test', 'tripfit');
    const value = await redis.get('test');
    console.log('✅ Redis 연결 성공! 값:', value);

  } catch (e) {
    console.error('❌ 연결 실패:', e.message);
  }
}
main();

// Supabase 슬립 방지 (5분마다 DB 쿼리)
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('💓 DB keep-alive ping');
  } catch (e) {
    console.error('DB ping 실패:', e.message);
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});