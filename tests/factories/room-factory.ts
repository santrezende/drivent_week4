import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createRooms(hotelId: number, capacity?: number) {
  return await prisma.room.create({
    data: {
      hotelId,
      capacity: capacity ?? faker.datatype.number({ min: 2 }),
      name: faker.commerce.department(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.future(),
    },
  });
}
