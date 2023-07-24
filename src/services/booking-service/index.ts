import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import roomRepository from '@/repositories/room-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function findBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw notFoundError();

  return booking;
}

async function createBooking(roomId: number, userId: number) {
  const room = await roomRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  const countBooking = await bookingRepository.countBookingsByRoomId(roomId);
  const isUnavailable = room.capacity <= countBooking;
  if (isUnavailable) throw forbiddenError();

  const enrollment = await enrollmentRepository.getEnrollmentByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status !== 'PAID') {
    throw forbiddenError();
  }
  return await bookingRepository.createBooking(roomId, userId);
}

async function updateBooking(roomId: number, userId: number, bookingId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw forbiddenError();

  const room = await roomRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  const countBooking = await bookingRepository.countBookingsByRoomId(roomId);
  const isUnavailable = room.capacity <= countBooking;
  if (isUnavailable) throw forbiddenError();

  const enrollment = await enrollmentRepository.getEnrollmentByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status !== 'PAID') {
    throw forbiddenError();
  }

  return await bookingRepository.updateBooking(roomId, bookingId);
}

const bookingService = {
  findBookingByUserId,
  createBooking,
  updateBooking,
};

export default bookingService;
