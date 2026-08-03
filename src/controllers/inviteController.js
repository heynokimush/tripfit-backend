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

// 초대 참여
const joinInvite = async (req, res) => {
    const { userId } = req.user;
    const { uuid } = req.params;

    try {
        // 1단계 - 여행 검증
        const trip = await prisma.trip.findUnique({
            where: { uuid },
            include: { members: true }
        });

        // 여행 존재x 경우
        if (!trip) {
            return res.status(404).json({ message: '여행 정보를 찾을 수 없습니다.' });
        }

        // 2단계 - 참여 기록 검증
        const alreadyMember = trip.members.some((mem) => mem.userId === userId);

        if (alreadyMember) {
            return res.status(409).json({ message: '이미 참여한 여행입니다.' });
        }

        // 3단계 - 멤버 추가
        await prisma.tripMember.create({
            data: { userId, tripId: trip.id }
        });

        return res.status(200).json({ message: '초대된 여행에 참여했습니다.', tripId: trip.uuid });

    } catch (err) {
        console.error('여행 참여 오류: ', err.message);
        return res.status(500).json({ message: '여행 참여 중 오류가 발생했습니다.' });
    }
}

module.exports = { createInvite, joinInvite };