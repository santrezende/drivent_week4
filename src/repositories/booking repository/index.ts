import { prisma } from '@/config';

async function findBookingByUserId(userId: number) {
  return await prisma.booking.findFirst({
    select: {
      id: true,
      Room: true,
    },
    where: {
      userId,
    },
  });
}

async function countBookingsByRoomId(roomId: number) {
  return await prisma.booking.count({ where: { roomId } });
}

async function createBooking(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

const bookingRepository = {
  findBookingByUserId,
  countBookingsByRoomId,
  createBooking,
};

export default bookingRepository;
