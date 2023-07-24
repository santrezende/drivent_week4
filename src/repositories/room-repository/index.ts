import { prisma } from '@/config';

async function findRoom(id: number) {
  return await prisma.room.findFirst({
    where: {
      id,
    },
  });
}

const roomRepository = {
  findRoom,
};

export default roomRepository;
