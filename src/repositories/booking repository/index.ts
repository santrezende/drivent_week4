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

async function updateBooking(roomId: number, id: number) {
  return await prisma.booking.update({
    data: {
      roomId,
      updatedAt: new Date(Date.now()),
    },
    where: {
      id,
    },
  });
}

const bookingRepository = {
  findBookingByUserId,
  countBookingsByRoomId,
  createBooking,
  updateBooking,
};

export default bookingRepository;
