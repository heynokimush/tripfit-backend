const prisma = require('../prisma');
const { v4: uuidv4 } = require('uuid');

// 초대 링크 생성
const createInvite = async(req, res) => {
    const { userId } = req.user;
    const { uuid } = req.params;

    try {
        const trip = await prisma.trip.findUnique({
            where: { uuid },
            include: { members: true}
        });

        if (!trip) {
            return res.status(404).json({ message: '여행 정보를 찾을 수 없습니다.' });
        }

        // 여행 멤버 검증
        const isMember = trip.members.some(m => m.userId === userId);

        // 여행 멤버가 아닐 경우
        if (!isMember) {
            return res.status(403).json({ message: '해당 여행 초대장에 권한이 없습니다.' });
        }

        const token = uuidv4();

        await prisma.tripInvite.create({
            data: {
                token,
                tripId: trip.id
            }
        });

        // 초대 링크 리턴 (주소 변경 필요)
        return res.status(201).json({ inviteUrl: `${process.env.DEV_URL}/invite/${token}` });
    } catch (err) {
        console.error('초대링크 생성 실패: ', err.message);
        return res.status(500).json({ message: '초대링크 생성에 실패했습니다.' });
    }
};

module.exports = { createInvite };