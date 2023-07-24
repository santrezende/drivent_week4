import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createRooms,
  createHotelsWithRooms,
  createTicket,
  createTicketTypeWithHotel,
  createUser,
  createBooking,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  describe('when token is invalid', () => {
    it('should respond with status 401 when token is invalid', async () => {
      const token = faker.word.adjective();

      const { statusCode } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 when token is missing', async () => {
      const { statusCode } = await server.get('/booking');

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 when token is not related to any session', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 200 and reservation data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(room.id, user.id);

      const { statusCode, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toBe(httpStatus.OK);
      expect(body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          hotelId: room.hotelId,
          capacity: room.capacity,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  describe('when token is invalid', () => {
    it('should respond with status 401 when token is invalid', async () => {
      const token = faker.word.adjective();

      const { statusCode } = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 when token is missing', async () => {
      const { statusCode } = await server.post('/booking');

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 when token is not related to any session', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond status 403 if room has no vacancies', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const roomWithoutVacancie = await createRooms(hotel.id, 4);
      for (let i = 0; i < 4; i++) {
        await createBooking(roomWithoutVacancie.id, user.id);
      }
      const { statusCode } = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomWithoutVacancie.id });

      expect(statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createRooms(hotel.id);

      const { statusCode, body } = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(statusCode).toBe(httpStatus.OK);
      expect(body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});

describe('PUT /booking', () => {
  describe('when token is invalid', () => {
    it('should respond with status 401 when token is invalid', async () => {
      const token = faker.word.adjective();

      const { statusCode } = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 when token is missing', async () => {
      const { statusCode } = await server.post('/booking');

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 when token is not related to any session', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when room has no capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room1 = await createRooms(hotel.id);
      const booking = await createBooking(room1.id, user.id);
      const room2 = await createRooms(hotel.id, 2);
      await createBooking(room2.id, user.id);
      await createBooking(room2.id, user.id);

      const { statusCode } = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room2.id });

      expect(statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when user has no reservation', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const newRoom = await createRooms(hotel.id, 0);

      const { statusCode } = await server
        .put(`/booking/${+Infinity}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(room.id, user.id);
      const newRoom = await createRooms(hotel.id);

      const { statusCode, body } = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(statusCode).toBe(httpStatus.OK);
      expect(body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});
