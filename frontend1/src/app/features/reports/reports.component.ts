import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';
import { FlightService } from '../../services/flight.service';
import { BookingService } from '../../services/booking.service';
import { CustomerService } from '../../services/customer.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { Flight } from '../../models/flight.model';
import { Booking } from '../../models/booking.model';

interface ReportData {
  totalFlights: number;
  totalBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  availableSeats: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h2>Reports Dashboard</h2>
      
      <!-- Loading Spinner -->
      <app-loading-spinner 
        [isLoading]="loading$ | async" 
        message="Loading reports...">
      </app-loading-spinner>
      
      <!-- Error Message -->
      <app-error-message 
        [error]="error$ | async" 
        [retryFn]="loadReports.bind(this)">
      </app-error-message>
      
      <!-- Reports Grid -->
      <div class="row" *ngIf="!(loading$ | async)">
        <div class="col-md-4 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Flights</h5>
              <p class="card-text display-4">{{ (reportData$ | async)?.totalFlights || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Bookings</h5>
              <p class="card-text display-4">{{ (reportData$ | async)?.totalBookings || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Customers</h5>
              <p class="card-text display-4">{{ (reportData$ | async)?.totalCustomers || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Revenue</h5>
              <p class="card-text display-4 text-success">
                {{ (reportData$ | async)?.totalRevenue || 0 | currency }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Available Seats</h5>
              <p class="card-text display-4 text-info">
                {{ (reportData$ | async)?.availableSeats || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Refresh Button -->
      <div class="text-center mt-4">
        <button 
          class="btn btn-primary" 
          (click)="loadReports()"
          [disabled]="loading$ | async">
          Refresh Reports
        </button>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  reportData$: Observable<ReportData>;

  constructor(
    private flightService: FlightService,
    private bookingService: BookingService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {
    // Combine data from multiple services with loading and error handling
    this.reportData$ = combineLatest([
      this.flightService.loadAllFlights().pipe(
        startWith([]),
        catchError(error => {
          this.errorSubject.next('Failed to load flights');
          return of([]);
        })
      ),
      this.bookingService.loadAllBookings().pipe(
        startWith([]),
        catchError(error => {
          this.errorSubject.next('Failed to load bookings');
          return of([]);
        })
      ),
      this.customerService.loadAllCustomers().pipe(
        startWith([]),
        catchError(error => {
          this.errorSubject.next('Failed to load customers');
          return of([]);
        })
      )
    ]).pipe(
      map(([flights, bookings, customers]) => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
        return {
          totalFlights: flights.length,
          totalBookings: bookings.length,
          totalCustomers: customers.length,
          totalRevenue: bookings.reduce((total: number, booking: Booking) => total + booking.price, 0),
          availableSeats: flights.reduce((total: number, flight: Flight) => total + flight.availableSeats, 0)
        };
      })
    );
  }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    // Trigger the observable to reload data
    this.reportData$.subscribe();
    this.notificationService.showInfo('Reports refreshed');
  }
} 