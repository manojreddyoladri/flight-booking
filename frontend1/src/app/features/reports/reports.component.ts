import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, BehaviorSubject, of, switchMap, catchError } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { ReportService, DashboardStats, ReportData, RevenueAnalysis } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorMessageComponent, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  
  // Real data observables
  reportData$: Observable<DashboardStats>;
  airlinePerformance$: Observable<ReportData[]>;
  revenueAnalysis$: Observable<RevenueAnalysis>;
  bookingTrends$: Observable<ReportData[]>;
  selectedAirlineData$: Observable<ReportData[]>;
  
  // Filter form
  filterForm: FormGroup;
  airlines: string[] = ['Delta Airlines', 'American Airlines', 'United Airlines', 'Southwest Airlines', 'JetBlue Airways', 'Alaska Airlines', 'Spirit Airlines', 'Frontier Airlines'];

  constructor(
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.filterForm = this.fb.group({
      dateRange: ['30'],
      startDate: [''],
      endDate: [''],
      airline: ['']
    });
    
    // Initialize observables
    this.reportData$ = this.reportService.getDashboardStats().pipe(
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        this.errorSubject.next('Failed to load dashboard statistics');
        return of({
          totalFlights: 0,
          totalBookings: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          availableSeats: 0,
          totalSeats: 0,
          occupancyRate: 0
        });
      })
    );
    
    this.airlinePerformance$ = this.reportService.getAirlinePerformance().pipe(
      catchError(error => {
        console.error('Error loading airline performance:', error);
        return of([]);
      })
    );
    
    this.revenueAnalysis$ = of({
      totalRevenue: 0,
      totalBookings: 0,
      averageBookingValue: 0,
      revenueByAirline: {}
    });
    this.bookingTrends$ = of([]);
    this.selectedAirlineData$ = of([]);
  }

  ngOnInit() {
    console.log('ReportsComponent ngOnInit called');
    this.loadReports();
  }

  loadReports() {
    console.log('loadReports called');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    // Reload dashboard stats
    this.reportData$ = this.reportService.getDashboardStats().pipe(
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        this.errorSubject.next('Failed to load dashboard statistics');
        return of({
          totalFlights: 0,
          totalBookings: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          availableSeats: 0,
          totalSeats: 0,
          occupancyRate: 0
        });
      })
    );
    
    // Reload airline performance
    this.airlinePerformance$ = this.reportService.getAirlinePerformance().pipe(
      catchError(error => {
        console.error('Error loading airline performance:', error);
        return of([]);
      })
    );
    
    this.loadingSubject.next(false);
  }

  onFilterChange() {
    const { startDate, endDate, airline } = this.filterForm.value;
    
    console.log('Filter values:', { startDate, endDate, airline });
    
    if (!startDate || !endDate) {
      this.notificationService.showWarning('Please select both start and end dates');
      return;
    }
    
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.notificationService.showError('Invalid date format. Please select valid dates.');
      return;
    }
    
    if (start > end) {
      this.notificationService.showWarning('Start date must be before or equal to end date');
      return;
    }
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    // Load filtered data
    this.bookingTrends$ = this.reportService.getBookingTrends(startDate, endDate).pipe(
      catchError(error => {
        console.error('Error loading booking trends:', error);
        this.errorSubject.next('Failed to load booking trends');
        return of([]);
      })
    );
    
    this.revenueAnalysis$ = this.reportService.getRevenueAnalysis(startDate, endDate).pipe(
      catchError(error => {
        console.error('Error loading revenue analysis:', error);
        this.errorSubject.next('Failed to load revenue analysis');
        return of({
          totalRevenue: 0,
          totalBookings: 0,
          averageBookingValue: 0,
          revenueByAirline: {}
        });
      })
    );
    
    if (airline) {
      console.log('Loading airline data for:', airline, 'from', startDate, 'to', endDate);
      // Load airline-specific revenue and store in observable
      this.selectedAirlineData$ = this.reportService.getRevenueByAirline(airline, startDate, endDate).pipe(
        catchError(error => {
          console.error('Error loading airline revenue:', error);
          this.notificationService.showError('Failed to load airline revenue data');
          return of([]);
        })
      );
      
      // Subscribe to see the data
      this.selectedAirlineData$.subscribe(data => {
        console.log('Airline data received:', data);
      });
    } else {
      // Clear airline data if no airline selected
      this.selectedAirlineData$ = of([]);
    }
    
    this.loadingSubject.next(false);
    this.notificationService.showSuccess('Filters applied successfully');
  }

  exportReports() {
    this.notificationService.showInfo('Export functionality will be implemented in the next version');
  }

  getOccupancyRateColor(rate: number): string {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-danger';
  }

  getRevenueColor(revenue: number): string {
    if (revenue > 10000) return 'text-success';
    if (revenue > 5000) return 'text-warning';
    return 'text-danger';
  }
} 