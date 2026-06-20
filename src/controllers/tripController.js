const prisma = require('../prisma');

// 전체 여행 리스트 조회
const getTrips = async (req, res) => {
  const { userId } = req.user;

  try {
    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ trips });

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
      where: { id: Number(tripId) },
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

    // 본인이 참여한 여행인지 확인 (다른 유저 정보 접근 방지)
    const isMember = trip.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    return res.status(200).json({ trip });

  } catch (err) {
    console.error('여행 상세 조회 에러:', err.message);
    return res.status(500).json({ message: '여행 상세 조회 중 오류가 발생했습니다.' });
  }
};

module.exports = { getTrips, getTripDetail };