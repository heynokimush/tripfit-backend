const prisma = require('../prisma');

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0].replace(/-/g, '.');
};

// 전체 여행 리스트 조회
const getTrips = async (req, res) => {
  const { userId } = req.user;

  try {
    const trips = await prisma.trip.findMany({
      where: {
        members: { some: { userId } },
      },
      orderBy: { startDate: 'desc' },
    });

    const formattedTrips = trips.map((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
      const region = trip.regionCodes.map((r) => r.regionName);

      return {
        id: String(trip.id),   // 그냥 숫자 id 문자열로
        region,
        startDate: formatDate(trip.startDate),
        endDate: formatDate(trip.endDate),
        nights,
        tags: trip.types,
      };
    });

    return res.status(200).json({ trips: formattedTrips });

  } catch (err) {
    console.error('여행 리스트 조회 에러:', err.message);
    return res.status(500).json({ message: '여행 리스트 조회 중 오류가 발생했습니다.' });
  }
};

// 특정 여행 상세 조회
const getTripDetail = async (req, res) => {
  const { userId } = req.user;
  const { tripId } = req.params;

  try {
    const trip = await prisma.trip.findUnique({
      where: { uuid: tripId },
      include: {
        schedule: true,
        members: {
          include: {
            user: {
              select: { id: true, nickname: true, profileImageUrl: true },
            },
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ message: '여행 정보를 찾을 수 없습니다.' });
    }

    const isMember = trip.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    // companions 포맷
    const companions = trip.members.map((m) => ({
      id: String(m.user.id),
      name: m.user.nickname,
      profileImage: m.user.profileImageUrl,
    }));

    // spots 포맷 (places JSON에서 꺼내기)
    const places = trip.schedule?.places || [];
    const spots = places.map((place, index) => ({
      id: place.id || `spot-${index + 1}`,  // AI가 id 주면 그거 쓰고 없으면 자동생성
      date: place.date,
      time: place.time,
      type: place.type,
      name: place.name,
      address: place.address,
      mapx: place.lng,
      mapy: place.lat,
      congestion: place.congestion,
    }));

    return res.status(200).json({
      id: trip.uuid,
      companions,
      spots,
    });

  } catch (err) {
    console.error('여행 상세 조회 에러:', err.message);
    return res.status(500).json({ message: '여행 상세 조회 중 오류가 발생했습니다.' });
  }
};

module.exports = { getTrips, getTripDetail };