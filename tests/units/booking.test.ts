import faker from '@faker-js/faker';
import bookingService from '@/services/booking-service';
import ticketsRepository from '@/repositories/tickets-repository';
import roomRepository from '@/repositories/room-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import bookingRepository from '@/repositories/booking repository';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET booking', () => {
  it('should return notFoundError when user do not have reservations', () => {
    const mockBooking = jest.spyOn(bookingRepository, 'findBookingByUserId');
    const userId = faker.datatype.number();

    mockBooking.mockImplementationOnce((userId: number) => {
      return null;
    });

    const promise = bookingService.findBookingByUserId(userId);

    expect(mockBooking).toBeCalledTimes(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});

describe('POST booking', () => {
  it('should return forbiddenError when tickettype is remote', async () => {
    const mockRoom = jest.spyOn(roomRepository, 'findRoom');
    mockRoom.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 5,
      };
    });

    const mockBooking = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    mockBooking.mockImplementation((roomId: number): any => {
      return 1;
    });

    const mockEnrollment = jest.spyOn(enrollmentRepository, 'getEnrollmentByUserId');
    mockEnrollment.mockImplementationOnce((userId: number): any => {
      return { id: 1 };
    });

    const mockTicket = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId');
    mockTicket.mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: 'PAID',
        TicketType: {
          isRemote: true,
          includesHotel: true,
        },
      };
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(mockRoom).toBeCalledTimes(1);
    expect(mockEnrollment).toBeCalledTimes(1);
    expect(mockTicket).toBeCalledTimes(1);
  });

  it('should return forbiddenError when user ticket has not been paid', async () => {
    const mockRoom = jest.spyOn(roomRepository, 'findRoom');
    mockRoom.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 5,
      };
    });
    const mockBooking = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    mockBooking.mockImplementation((roomId: number): any => {
      return 1;
    });
    const mockEnrollment = jest.spyOn(enrollmentRepository, 'getEnrollmentByUserId');
    mockEnrollment.mockImplementationOnce((userId: number): any => {
      return { id: 1 };
    });

    const mockTicket = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId');
    mockTicket.mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: 'RESERVED',
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(mockRoom).toBeCalledTimes(1);
    expect(mockEnrollment).toBeCalledTimes(1);
    expect(mockTicket).toBeCalledTimes(1);
  });

  it('should return notFoundError when room do not exists', () => {
    const mockRoom = jest.spyOn(roomRepository, 'findRoom');
    const userId = faker.datatype.number({ min: 1 });
    const roomId = faker.datatype.number({ min: 1 });
    mockRoom.mockImplementationOnce((roomId: number): any => {
      return null;
    });

    const promise = bookingService.createBooking(roomId, userId);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
    expect(mockRoom).toBeCalledTimes(1);
  });

  it('should return forbiddenError when user ticket does not include hotel', async () => {
    const mockRoom = jest.spyOn(roomRepository, 'findRoom');
    mockRoom.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 5,
      };
    });
    const mockBooking = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    mockBooking.mockImplementation((roomId: number): any => {
      return 1;
    });
    const mockEnrollment = jest.spyOn(enrollmentRepository, 'getEnrollmentByUserId');
    mockEnrollment.mockImplementationOnce((userId: number): any => {
      return { id: 1 };
    });

    const mockTicket = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId');
    mockTicket.mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: 'PAID',
        TicketType: {
          isRemote: false,
          includesHotel: false,
        },
      };
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(mockRoom).toBeCalledTimes(1);
    expect(mockEnrollment).toBeCalledTimes(1);
    expect(mockTicket).toBeCalledTimes(1);
  });

  it('should return forbiddenError when room do not have enought capacity', () => {
    const mockRoom = jest.spyOn(roomRepository, 'findRoom');
    mockRoom.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 4,
      };
    });

    const mockBooking = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    mockBooking.mockImplementation((roomId: number): any => {
      return 4;
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(mockRoom).toBeCalledTimes(1);
  });
});
