import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { FlightService } from '../../services/flight.service';
import { Booking, BookingRequest } from '../../models/booking.model';
import { Flight } from '../../models/flight.model';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html'
})
export class BookingsComponent implements OnInit, OnDestroy {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  private flightsSubject = new BehaviorSubject<Flight[]>([]);
  bookings$: Observable<Booking[]>;
  flights$: Observable<Flight[]>;
  bookingForm: FormGroup;
  searchCustomerId: number | null = null;
  customerBookings: Booking[] = [];
  selectedFlightAvailable = false;
  private selectedFlightId: string | null = null;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  private subscription = new Subscription();

  constructor(
    private bookingService: BookingService,
    private flightService: FlightService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.bookings$ = this.bookingsSubject.asObservable();
    this.flights$ = this.flightsSubject.asObservable();
    this.loading$ = new Observable<boolean>();
    this.error$ = new Observable<string | null>();
    
    this.bookingForm = this.fb.group({
      flightId: ['', Validators.required],
      customerId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]]
    });

    // Listen to flight selection changes
    this.subscription.add(
      this.bookingForm.get('flightId')!.valueChanges.subscribe(selectedFlightId => {
        console.log('Flight selection changed to:', selectedFlightId);
        this.updateFlightAvailability(selectedFlightId);
      })
    );
  }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadData() {
    // Load flights
    this.subscription.add(
      this.flightService.loadAllFlights().subscribe({
        next: (flights) => {
          this.flightsSubject.next(flights);
          this.notificationService.showSuccess('Flights loaded successfully');
        },
        error: (error) => {
          this.notificationService.showError('Failed to load flights');
        }
      })
    );
    
    // Load bookings
    this.subscription.add(
      this.bookingService.loadAllBookings().subscribe({
        next: (bookings) => {
          this.bookingsSubject.next(bookings);
          this.notificationService.showSuccess('Bookings loaded successfully');
        },
        error: (error) => {
          this.notificationService.showError('Failed to load bookings');
        }
      })
    );
  }

  private updateFlightAvailability(selectedFlightId: string | null) {
    if (!selectedFlightId) {
      this.selectedFlightAvailable = false;
      return;
    }

    // Use current flights from BehaviorSubject
    const flights = this.flightsSubject.value;
    const flightIdNumber = Number(selectedFlightId);
    const selectedFlight = flights.find(f => f.id === flightIdNumber);
    this.selectedFlightAvailable = selectedFlight ? selectedFlight.availableSeats > 0 : false;
    console.log('Updated flight availability:', this.selectedFlightAvailable, 'for flight:', selectedFlight);
  }

  private refreshFlights() {
    this.subscription.add(
      this.flightService.loadAllFlights().subscribe({
        next: (flights) => {
          this.flightsSubject.next(flights);
          console.log('Flights refreshed, updating availability...');
          
          // Update flight availability if a flight is currently selected
          if (this.selectedFlightId) {
            this.updateFlightAvailability(this.selectedFlightId);
          }
        },
        error: (error) => {
          console.error('Failed to refresh flights:', error);
        }
      })
    );
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const bookingRequest: BookingRequest = {
        flightId: Number(this.bookingForm.value.flightId),
        customerId: Number(this.bookingForm.value.customerId),
        price: Number(this.bookingForm.value.price)
      };
      console.log('Submitting booking request:', bookingRequest);
      
      this.subscription.add(
        this.bookingService.createBooking(bookingRequest).subscribe({
          next: (booking) => {
            this.notificationService.showSuccess('Booking created successfully!');
            this.bookingForm.reset();
            
            // Add the new booking to the current list
            const currentBookings = this.bookingsSubject.value;
            this.bookingsSubject.next([...currentBookings, booking]);
            
            // Refresh flights to update availability immediately
            this.refreshFlights();
          },
          error: (error) => {
            this.notificationService.showError(error.message || 'Failed to create booking');
          }
        })
      );
    }
  }

  searchCustomerBookings() {
    if (this.searchCustomerId) {
      this.subscription.add(
        this.bookingService.getBookingsByCustomer(this.searchCustomerId).subscribe({
          next: (bookings) => {
            this.customerBookings = bookings;
            this.notificationService.showSuccess(`Found ${bookings.length} bookings for customer ${this.searchCustomerId}`);
          },
          error: (error) => {
            console.error('Error fetching customer bookings:', error);
            this.customerBookings = [];
            this.notificationService.showError('Failed to fetch customer bookings');
          }
        })
      );
    }
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.subscription.add(
        this.bookingService.cancelBooking(bookingId).subscribe({
          next: () => {
            this.notificationService.showSuccess('Booking cancelled successfully!');
            
            // Remove the cancelled booking from the current list
            const currentBookings = this.bookingsSubject.value;
            const updatedBookings = currentBookings.filter(b => b.id !== bookingId);
            this.bookingsSubject.next(updatedBookings);
            
            // Also remove from customer bookings if present
            this.customerBookings = this.customerBookings.filter(b => b.id !== bookingId);
            
            // Refresh flights to update availability immediately
            this.refreshFlights();
          },
          error: (error) => {
            this.notificationService.showError('Failed to cancel booking');
          }
        })
      );
    }
  }
} 