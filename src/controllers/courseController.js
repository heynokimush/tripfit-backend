const axios = require('axios');
const prisma = require('../prisma');
const { parse } = require('node:path');
const { StringDecoder } = require('string_decoder');

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

    //임시 mock 데이터 (AI 서버 생기면 주석 해제)
    // const places = [
    // {
    //     name: "경복궁",
    //     address: "서울 종로구 사직로 161",
    //     lat: "37.579617",
    //     lng: "126.977041",
    //     date: date.startDate,
    //     time: "10:00",
    //     congestion: "moderate"
    // }
    // ];
    

    // // 3. Schedule DB에 저장
    // const schedule = await prisma.schedule.create({
    //   data: {
    //     tripId: trip.id,
    //     places: places,
    //   },
    // });

    // // 4. 프론트에 응답
    // return res.status(201).json({
    //   tripId: trip.uuid,
    //   scheduleId: schedule.id,
    //   places,
    // });

  } catch (err) {
    // AI 서버 연결 실패 시
    if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
      return res.status(503).json({ message: 'AI 서버에 연결할 수 없습니다.' });
    }
    console.error('코스 생성 에러:', err.message);
    return res.status(500).json({ message: '코스 생성 중 오류가 발생했습니다.' });
  }
};

const createCourseStream = async (req, res) => {
  console.log(" createCourseStream 진입 ");
  const { userId } = req.user;
  const { types, regionCodes, startDate, endDate } = req.query; 
  // GET이라 body 대신 query로 받음. types/regionCodes는 JSON.stringify해서 프론트가 전달

  // SSE 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 요청값 파싱
    const parsedTypes = JSON.parse(types);
    const parsedRegionCodes = JSON.parse(regionCodes);

    if (!parsedTypes || !parsedRegionCodes || !startDate || !endDate) {
      sendEvent('error', { message: '필수 값이 없습니다.' });
      return res.end();
    }

    // 진행상황 단계별 전송
    sendEvent('progress', { step: 'trip_create', message: '여행 정보를 생성하고 있어요' });

    const trip = await prisma.trip.create({
      data: {
        regionCodes: parsedRegionCodes,
        types: parsedTypes,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        members: { create: { userId } },
      },
    });

    sendEvent('progress', { step: 'region_analyze', message: '지역 정보를 분석하고 있어요' });

    sendEvent('progress', { step: 'ai_generate', message: 'AI가 코스를 추천하고 있어요' });

    // 실제 AI 서버 호출 (아직 없으면 mock)
    // const places = [
    //   {
    //     id: uuidv4(),
    //     name: '경복궁',
    //     address: '서울 종로구 사직로 161',
    //     mapx: '126.977041',
    //     mapy: '37.579617',
    //     date: startDate,
    //     time: '10:00',
    //   },
    // ];

    console.log("AI 서버 호출 시작 ", process.env.AI_SERVER_URL);
    console.log({
      cityCode: parsedRegionCodes[0].areaCode,
      stateCode: parsedRegionCodes[0].sigunguCode,
      startDate,
      endDate,
      partnerType: parsedTypes[0]
    })

    const aiResponse = await axios.post(`${process.env.AI_SERVER_URL}/course`, {
      cityCode: parsedRegionCodes[0].areaCode,
      stateCode: parsedRegionCodes[0].sigunguCode,
      startDate,
      endDate,
      partnerType: parsedTypes[0]
    }, {
      responseType: 'stream'
    });

    // const aiResponse = await axios.post(`${process.env.AI_SERVER_URL}/course`, {
    //   types: parsedTypes, regionCodes: parsedRegionCodes, startDate, endDate,
    // });
    // const places = aiResponse.data.places;

    const decoder = new StringDecoder('utf8');
    let buffer = '';
    // let finalJson = '';

    // 3. AI SSE 스트림 읽기
    aiResponse.data.on('data', chunk => {
      buffer += decoder.write(chunk);

      const events = buffer.split('\n\n');
      buffer = events.pop();

      for (const e of events) {
        const lines = event.split('\n');

        let eventType = '';
        let data = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          }

          if (line.startsWith('data:')) {
            data += line.slice(5).trim();
          }
        }

        if (!data) continue;

        try {
          const parsedData = JSON.parse(data);

          if (eventType === 'progress') {
            sendEvent('progress', {
              message: parsedData.message
            });
          }

          if (eventType === 'done') {
            finalJson = parsedData;
          }
        } catch (err) {
          console.error('SEE data 파싱 오류: ', err);
        }
      }
    });

    // 스트림 종료
    aiResponse.data.on('end', async ()=>{
        try{
          const course = finalJson;

          // AI 응답 places 추출
          const places = course.days.flatMap(day => day.places.map(place=>({
                  date: day.date,
                  name: place.name,
                  address: place.address,
                  mapx: place.mapx,
                  mapy: place.mapy,
                  img: place.img,
                  congestion: place.congestion,
                  description: place.description
                }))
            );

          // DB 저장
          const schedule =
            await prisma.schedule.create({
              data:{ tripId:trip.id, places}
            });

          sendEvent('done', {
            tripId: trip.uuid,
            scheduleId: schedule.id,
            places
            }
          );
          res.end();

        } catch(err){
          console.error("AI JSON 처리 오류", err);
          sendEvent('error', { message: 'AI 결과 처리 실패' });
          res.end();
        }
      }
    );

  }catch(err){

    console.error("AI 스트림 오류", err);


    sendEvent('error', { message:'AI 서버 연결 실패'});
    res.end();
  }
};

module.exports = { createCourse, createCourseStream };