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
import { NotificationService } from '../../shared/components/notification/notification.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit, OnDestroy {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  private flightsSubject = new BehaviorSubject<Flight[]>([]);
  private availableFlightsSubject = new BehaviorSubject<Flight[]>([]);
  bookings$: Observable<Booking[]>;
  flights$: Observable<Flight[]>;
  availableFlights$: Observable<Flight[]>;
  bookingForm: FormGroup;
  searchCustomerId: number | null = null;
  customerBookings: Booking[] = [];
  selectedFlightAvailable = false;
  private selectedFlightId: string | null = null;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedDate: string = '';
  private subscription = new Subscription();

  constructor(
    private bookingService: BookingService,
    private flightService: FlightService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.bookings$ = this.bookingsSubject.asObservable();
    this.flights$ = this.flightsSubject.asObservable();
    this.availableFlights$ = this.availableFlightsSubject.asObservable();
    this.loading$ = new Observable<boolean>();
    this.error$ = new Observable<string | null>();
    
    this.bookingForm = this.fb.group({
      flightId: ['', Validators.required],
      customerId: ['', Validators.required],
      price: [{value: '', disabled: true}, [Validators.required, Validators.min(0)]]
    });

    // Listen to flight selection changes
    this.subscription.add(
      this.bookingForm.get('flightId')!.valueChanges.subscribe(selectedFlightId => {
        console.log('Flight selection changed to:', selectedFlightId);
        this.updateFlightAvailability(selectedFlightId);
        this.updatePriceFromSelectedFlight(selectedFlightId);
      })
    );
  }

  ngOnInit() {
    this.loadBookings();
    // Set default date to today
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadFlightsByDate(this.selectedDate);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onDateChange() {
    console.log('onDateChange called with:', this.selectedDate);
    if (this.selectedDate) {
      this.loadFlightsByDate(this.selectedDate);
      // Reset flight selection when date changes
      this.bookingForm.patchValue({ flightId: '' });
      this.bookingForm.get('price')!.setValue('');
      this.selectedFlightAvailable = false;
    }
  }

  private loadFlightsByDate(date: string) {
    console.log('loadFlightsByDate called with:', date);
    // Only load flights if the selected date is today or in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedDate < today) {
      this.flightsSubject.next([]);
      this.availableFlightsSubject.next([]);
      this.notificationService.showWarning('Please select today or a future date');
      return;
    }
    
    this.subscription.add(
      this.flightService.getFlightsByDate(date).subscribe({
        next: (flights) => {
          this.flightsSubject.next(flights);
          // Filter to only show flights with available seats
          const availableFlights = flights.filter(flight => flight.availableSeats > 0);
          this.availableFlightsSubject.next(availableFlights);
          this.notificationService.showSuccess(`Loaded ${flights.length} flights for ${date}`);
        },
        error: (error) => {
          this.notificationService.showError('Failed to load flights for selected date');
        }
      })
    );
  }

  private loadBookings() {
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

  private updatePriceFromSelectedFlight(selectedFlightId: string | null) {
    if (!selectedFlightId) {
      this.bookingForm.get('price')!.setValue('');
      return;
    }

    const flights = this.flightsSubject.value;
    const flightIdNumber = Number(selectedFlightId);
    const selectedFlight = flights.find(f => f.id === flightIdNumber);

    if (selectedFlight) {
      this.bookingForm.get('price')!.setValue(selectedFlight.price.toString());
    } else {
      this.bookingForm.get('price')!.setValue('');
    }
  }

  private refreshFlights() {
    if (this.selectedDate) {
      this.loadFlightsByDate(this.selectedDate);
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const bookingRequest: BookingRequest = {
        flightId: Number(this.bookingForm.value.flightId),
        customerId: Number(this.bookingForm.value.customerId),
        price: Number(this.bookingForm.get('price')!.value) // Get value from disabled control
      };
      console.log('Submitting booking request:', bookingRequest);
      
      this.subscription.add(
        this.bookingService.createBooking(bookingRequest).subscribe({
          next: (booking) => {
            this.notificationService.showSuccess('Booking created successfully!');
            this.resetBookingForm();
            
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

  private resetBookingForm() {
    this.bookingForm.reset();
    this.bookingForm.get('price')!.setValue('');
    this.selectedFlightAvailable = false;
  }

  getSelectedFlightDetails(): Flight | null {
    const selectedFlightId = this.bookingForm.get('flightId')?.value;
    if (!selectedFlightId) return null;
    
    const flights = this.flightsSubject.value;
    const flightIdNumber = Number(selectedFlightId);
    return flights.find(f => f.id === flightIdNumber) || null;
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