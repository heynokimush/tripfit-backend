const axios = require('axios');
const prisma = require('../prisma');

const createCourse = async (req, res) => {
  const { userId } = req.user;
  const { types, regionCodes, date } = req.body;

  // 요청값 검증
  if (!types || !regionCodes || !date?.startDate || !date?.endDate) {
    return res.status(400).json({ message: '필수 값이 없습니다.' });
  }

  try {
    // 1. Trip 생성
    const trip = await prisma.trip.create({
      data: {
        regionCodes,
        types,
        startDate: new Date(date.startDate),
        endDate: new Date(date.endDate),
        members: {
          create: { userId }, // 요청한 유저를 멤버로 추가
        },
      },
    });

    // 임시 mock 데이터 (AI 서버 생기면 주석 해제)
    const places = [
    {
        name: "경복궁",
        address: "서울 종로구 사직로 161",
        lat: "37.579617",
        lng: "126.977041",
        date: date.startDate,
        time: "10:00",
        congestion: "moderate"
    }
    ];
    // // 2. 파이썬 AI 서버로 코스 요청
    // const aiResponse = await axios.post(
    //   `${process.env.AI_SERVER_URL}/course`,
    //   {
    //     types,
    //     regionCodes,
    //     startDate: date.startDate,
    //     endDate: date.endDate,
    //   }
    // );

    // const places = aiResponse.data.places; // AI 서버 응답값

    // 3. Schedule DB에 저장
    const schedule = await prisma.schedule.create({
      data: {
        tripId: trip.id,
        places: places,
      },
    });

    // 4. 프론트에 응답
    return res.status(201).json({
      tripId: trip.uuid,
      scheduleId: schedule.id,
      places,
    });

  } catch (err) {
    // AI 서버 연결 실패 시
    if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
      return res.status(503).json({ message: 'AI 서버에 연결할 수 없습니다.' });
    }
    console.error('코스 생성 에러:', err.message);
    return res.status(500).json({ message: '코스 생성 중 오류가 발생했습니다.' });
  }
};

module.exports = { createCourse };