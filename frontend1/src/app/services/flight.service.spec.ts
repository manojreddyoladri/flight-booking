import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FlightService } from './flight.service';
import { Flight } from '../models/flight.model';

describe('FlightService', () => {
  let service: FlightService;
  let httpMock: HttpTestingController;

  const mockFlight: Flight = {
    id: 1,
    airlineName: 'Test Airlines',
    totalSeats: 150,
    availableSeats: 100,
    flightDate: '2025-01-15',
    price: 299.99
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FlightService]
    });
    service = TestBed.inject(FlightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAllFlights', () => {
    it('should return flights from API', () => {
      const mockFlights = [mockFlight];

      service.loadAllFlights().subscribe(flights => {
        expect(flights).toEqual(mockFlights);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlights);
    });

    it('should handle error when API fails', () => {
      service.loadAllFlights().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to load flights');
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getFlightsByDate', () => {
    it('should return flights for specific date', () => {
      const mockFlights = [mockFlight];
      const date = '2025-01-15';

      service.getFlightsByDate(date).subscribe(flights => {
        expect(flights).toEqual(mockFlights);
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/flights/by-date?date=${date}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFlights);
    });
  });

  describe('getFutureFlights', () => {
    it('should return future flights from specific date', () => {
      const mockFlights = [mockFlight];
      const fromDate = '2025-01-01';

      service.getFutureFlights(fromDate).subscribe(flights => {
        expect(flights).toEqual(mockFlights);
      });

      const req = httpMock.expectOne(`http://localhost:8080/api/flights/future?fromDate=${fromDate}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFlights);
    });
  });

  describe('getFutureFlightsToday', () => {
    it('should return future flights from backend current date', () => {
      const mockFlights = [mockFlight];

      service.getFutureFlightsToday().subscribe(flights => {
        expect(flights).toEqual(mockFlights);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights/future-today');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlights);
    });
  });

  describe('addFlight', () => {
    it('should create a new flight', () => {
      const newFlight: Flight = { ...mockFlight, id: 0 };

      service.addFlight(newFlight).subscribe(flight => {
        expect(flight).toEqual(mockFlight);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newFlight);
      req.flush(mockFlight);
    });
  });

  describe('updateFlight', () => {
    it('should update an existing flight', () => {
      const updatedFlight = { ...mockFlight, price: 399.99 };

      service.updateFlight(1, updatedFlight).subscribe(flight => {
        expect(flight).toEqual(updatedFlight);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedFlight);
      req.flush(updatedFlight);
    });
  });

  describe('deleteFlight', () => {
    it('should delete a flight', () => {
      service.deleteFlight(1).subscribe(() => {
        expect().nothing();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('checkAvailability', () => {
    it('should check seat availability for a flight', () => {
      service.checkAvailability(1).subscribe(availability => {
        expect(availability).toBe(100);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights/1/availability');
      expect(req.request.method).toBe('GET');
      req.flush(100);
    });
  });

  describe('refreshFlights', () => {
    it('should refresh flights by calling loadAllFlights', () => {
      const mockFlights = [mockFlight];

      service.refreshFlights().subscribe(flights => {
        expect(flights).toEqual(mockFlights);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/flights');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlights);
    });
  });
});
