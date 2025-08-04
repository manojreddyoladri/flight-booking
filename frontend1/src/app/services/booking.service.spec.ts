import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { FlightService } from './flight.service';
import { environment } from '../../environments/environment.prod';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;
  let flightService: jasmine.SpyObj<FlightService>;

  const mockBooking = {
    id: 1,
    customerId: 1,
    flightId: 1,
    price: 299.99,
    bookingDate: '2025-01-15T10:00:00'
  };

  const mockBookingRequest = {
    customerId: 1,
    flightId: 1,
    price: 299.99
  };

  beforeEach(() => {
    const flightServiceSpy = jasmine.createSpyObj('FlightService', ['refreshFlights']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookingService,
        { provide: FlightService, useValue: flightServiceSpy }
      ]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
    flightService = TestBed.inject(FlightService) as jasmine.SpyObj<FlightService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAllBookings', () => {
    it('should return all bookings', () => {
      const mockBookings = [mockBooking];

      service.loadAllBookings().subscribe(bookings => {
        expect(bookings).toEqual(mockBookings);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBookings);
    });

    it('should handle error when API fails', () => {
      service.loadAllBookings().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to load bookings');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createBooking', () => {
    it('should create a new booking', () => {
      service.createBooking(mockBookingRequest).subscribe(booking => {
        expect(booking).toEqual(mockBooking);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBookingRequest);
      req.flush(mockBooking);
    });

    it('should handle error when API fails', () => {
      service.createBooking(mockBookingRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to create booking');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 400 error with custom message', () => {
      service.createBooking(mockBookingRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Invalid booking request');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 404 error with custom message', () => {
      service.createBooking(mockBookingRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Flight or customer not found');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getBookingsByCustomer', () => {
    it('should return bookings for a specific customer', () => {
      const mockBookings = [mockBooking];

      service.getBookingsByCustomer(1).subscribe(bookings => {
        expect(bookings).toEqual(mockBookings);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/customer/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBookings);
    });

    it('should handle error when API fails', () => {
      service.getBookingsByCustomer(1).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to fetch customer bookings');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/customer/1`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', () => {
      service.cancelBooking(1).subscribe(() => {
        expect().nothing();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when cancellation fails', () => {
      service.cancelBooking(1).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to cancel booking');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/bookings/1`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
}); 