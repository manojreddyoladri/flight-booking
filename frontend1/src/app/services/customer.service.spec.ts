import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  const mockCustomer = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService]
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCustomer', () => {
    it('should create a new customer', () => {
      const newCustomer = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      };

      service.createCustomer(newCustomer as any).subscribe(customer => {
        expect(customer).toEqual(mockCustomer);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/customers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCustomer);
      req.flush(mockCustomer);
    });

    it('should handle error when API fails', () => {
      const newCustomer = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      };

      service.createCustomer(newCustomer as any).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to create customer');
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/customers');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by ID', () => {
      service.getCustomerById(1).subscribe(customer => {
        expect(customer).toEqual(mockCustomer);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/customers/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomer);
    });

    it('should handle error when customer not found', () => {
      service.getCustomerById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to fetch customer');
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/customers/999');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('loadAllCustomers', () => {
    it('should return all customers', () => {
      const mockCustomers = [mockCustomer];

      service.loadAllCustomers().subscribe(customers => {
        expect(customers).toEqual(mockCustomers);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/customers');
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });

    it('should handle error when API fails', () => {
      service.loadAllCustomers().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.message).toBe('Failed to load customers');
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/customers');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
}); 