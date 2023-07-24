import Joi from 'joi';
import { InputBooking } from '@/protocols';

export const bookingSchema = Joi.object<InputBooking>({
  roomId: Joi.number().required(),
});
