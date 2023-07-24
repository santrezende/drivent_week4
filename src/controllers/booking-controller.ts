import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { InputBooking } from '@/protocols';

async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.findBookingByUserId(userId);
  res.status(httpStatus.OK).send(booking);
}

async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body as InputBooking;
  const { userId } = req;

  const booking = await bookingService.createBooking(roomId, userId);

  res.status(httpStatus.OK).send({ bookingId: booking.id });
}

async function updateBooking(req: AuthenticatedRequest, res: Response) {}

const bookingController = {
  getBooking,
  createBooking,
  updateBooking,
};

export default bookingController;
