import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas/booking-schemas';
import bookingController from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', bookingController.getBooking)
  .post('/', validateBody(bookingSchema), bookingController.createBooking)
  .put('/:bookingId', validateBody(bookingSchema), bookingController.updateBooking);

export { bookingRouter };
