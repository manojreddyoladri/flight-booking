import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportService, DashboardStats, ReportData, RevenueAnalysis } from './report.service';
import { environment } from '../../environments/environment.prod';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportService]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', () => {
      const mockStats: DashboardStats = {
        totalFlights: 10,
        totalBookings: 50,
        totalCustomers: 25,
        totalRevenue: 15000,
        availableSeats: 500,
        totalSeats: 1000,
        occupancyRate: 50
      };

      service.getDashboardStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reports/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should handle error when API fails', () => {
      service.getDashboardStats().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to load dashboard statistics');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reports/dashboard`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getRevenueByAirline', () => {
    it('should return revenue by airline', () => {
      const mockRevenue: ReportData[] = [
        {
          airlineName: 'Test Airlines',
          ticketsSold: 10,
          totalRevenue: 5000,
          averagePrice: 500
        }
      ];

      service.getRevenueByAirline('Test Airlines', '2025-01-01', '2025-01-31').subscribe(revenue => {
        expect(revenue).toEqual(mockRevenue);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reports/revenue?airline=Test Airlines&startDate=2025-01-01&endDate=2025-01-31`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRevenue);
    });
  });

  describe('getBookingTrends', () => {
    it('should return booking trends', () => {
      const mockTrends: ReportData[] = [
        {
          airlineName: '2025-01-01',
          ticketsSold: 5,
          totalRevenue: 1500,
          averagePrice: 300
        },
        {
          airlineName: '2025-01-02',
          ticketsSold: 8,
          totalRevenue: 2400,
          averagePrice: 300
        }
      ];

      service.getBookingTrends('2025-01-01', '2025-01-31').subscribe(trends => {
        expect(trends).toEqual(mockTrends);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reports/booking-trends?startDate=2025-01-01&endDate=2025-01-31`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrends);
    });
  });

  describe('getRevenueAnalysis', () => {
    it('should return revenue analysis', () => {
      const mockAnalysis: RevenueAnalysis = {
        totalRevenue: 15000,
        totalBookings: 50,
        averageBookingValue: 300,
        revenueByAirline: {
          'Test Airlines': 5000,
          'Another Airlines': 10000
        }
      };

      service.getRevenueAnalysis('2025-01-01', '2025-01-31').subscribe(analysis => {
        expect(analysis).toEqual(mockAnalysis);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reports/revenue-analysis?startDate=2025-01-01&endDate=2025-01-31`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalysis);
    });
  });
}); 