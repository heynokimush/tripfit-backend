const prisma = require('../prisma');
const { v4: uuidv4 } = require('uuid');

// 공통 헬퍼 - trip 조회 및 권한 확인
const getTripAndSchedule = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({
    where: { uuid: tripId },
    include: {
      schedule: true,
      members: true,
    },
  });

  if (!trip) return { error: 404, message: '여행 정보를 찾을 수 없습니다.' };

  const isMember = trip.members.some((m) => m.userId === userId);
  if (!isMember) return { error: 403, message: '접근 권한이 없습니다.' };

  if (!trip.schedule) return { error: 404, message: '일정 정보를 찾을 수 없습니다.' };

  return { trip };
};

// spots 포맷 헬퍼
const formatSpot = (place) => ({
  id: place.id,
  date: place.date,
  time: place.time,
  type: place.type,
  name: place.name,
  address: place.address,
  mapx: place.mapx,
  mapy: place.mapy,
  congestion: place.congestion,
});

// 일정 추가
const addSpot = async (req, res) => {
  const { userId } = req.user;
  const { tripId } = req.params;
  const { date, time, type, name, address, mapx, mapy, congestion } = req.body;

  if (!date || !time || !name || !address) {
    return res.status(400).json({ message: '필수 값이 없습니다.' });
  }

  try {
    const { trip, error, message } = await getTripAndSchedule(tripId, userId);
    if (error) return res.status(error).json({ message });

    const places = trip.schedule.places || [];

    const newSpot = {
      id: uuidv4(),  // spot id 자동 생성
      date,
      time,
      type,
      name,
      address,
      mapx,
      mapy,
      congestion,
    };

    const updatedPlaces = [...places, newSpot];

    await prisma.schedule.update({
      where: { tripId: trip.id },
      data: { places: updatedPlaces },
    });

    return res.status(201).json({ spots: updatedPlaces.map(formatSpot) });

  } catch (err) {
    console.error('일정 추가 에러:', err.message);
    return res.status(500).json({ message: '일정 추가 중 오류가 발생했습니다.' });
  }
};

// 일정 수정
const updateSpot = async (req, res) => {
  const { userId } = req.user;
  const { tripId, spotId } = req.params;
  const updateData = req.body;

  try {
    const { trip, error, message } = await getTripAndSchedule(tripId, userId);
    if (error) return res.status(error).json({ message });

    const places = trip.schedule.places || [];
    const spotIndex = places.findIndex((p) => p.id === spotId);

    if (spotIndex === -1) {
      return res.status(404).json({ message: '해당 장소를 찾을 수 없습니다.' });
    }

    // 기존 spot에 수정 내용 병합 (부분 수정 가능)
    const updatedPlaces = [...places];
    updatedPlaces[spotIndex] = { ...places[spotIndex], ...updateData };

    await prisma.schedule.update({
      where: { tripId: trip.id },
      data: { places: updatedPlaces },
    });

    return res.status(200).json({ spots: updatedPlaces.map(formatSpot) });

  } catch (err) {
    console.error('일정 수정 에러:', err.message);
    return res.status(500).json({ message: '일정 수정 중 오류가 발생했습니다.' });
  }
};

// 일정 삭제
const deleteSpot = async (req, res) => {
  const { userId } = req.user;
  const { tripId, spotId } = req.params;

  try {
    const { trip, error, message } = await getTripAndSchedule(tripId, userId);
    if (error) return res.status(error).json({ message });

    const places = trip.schedule.places || [];
    const spotExists = places.some((p) => p.id === spotId);

    if (!spotExists) {
      return res.status(404).json({ message: '해당 장소를 찾을 수 없습니다.' });
    }

    const updatedPlaces = places.filter((p) => p.id !== spotId);

    await prisma.schedule.update({
      where: { tripId: trip.id },
      data: { places: updatedPlaces },
    });

    return res.status(200).json({ spots: updatedPlaces.map(formatSpot) });

  } catch (err) {
    console.error('일정 삭제 에러:', err.message);
    return res.status(500).json({ message: '일정 삭제 중 오류가 발생했습니다.' });
  }
};

module.exports = { addSpot, updateSpot, deleteSpot };