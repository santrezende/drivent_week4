import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.findBookingByUserId(userId);
  res.status(httpStatus.OK).send(booking);
}

async function createBooking(req: AuthenticatedRequest, res: Response) {}

async function updateBooking(req: AuthenticatedRequest, res: Response) {}

const bookingController = {
  getBooking,
  createBooking,
  updateBooking,
};

export default bookingController;
