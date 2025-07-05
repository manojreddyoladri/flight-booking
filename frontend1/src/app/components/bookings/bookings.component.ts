import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { FlightService } from '../../services/flight.service';
import { Booking, BookingRequest } from '../../models/booking.model';
import { Flight } from '../../models/flight.model';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable, map, combineLatest, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './bookings.component.html'
})
export class BookingsComponent implements OnInit {
  bookings$: Observable<Booking[]>;
  flights$: Observable<Flight[]>;
  bookingForm: FormGroup;
  searchCustomerId: number | null = null;
  customerBookings: Booking[] = [];
  selectedFlightAvailable = false;
  private selectedFlightId: string | null = null;

  constructor(
    private bookingService: BookingService,
    private flightService: FlightService,
    private fb: FormBuilder
  ) {
    this.bookings$ = this.bookingService.bookings$;
    this.flights$ = this.flightService.flights$;
    this.bookingForm = this.fb.group({
      flightId: ['', Validators.required],
      customerId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]]
    });

    // Listen to flight selection changes
    this.bookingForm.get('flightId')!.valueChanges.subscribe(selectedFlightId => {
      console.log('Flight selection changed to:', selectedFlightId);
      this.selectedFlightId = selectedFlightId;
      this.updateFlightAvailability();
    });

    // Listen to flights data changes to update availability
    this.flights$.subscribe(flights => {
      console.log('Flights data updated:', flights);
      this.updateFlightAvailability();
    });
  }

  ngOnInit() {
    this.flightService.loadAll();
    this.bookingService.loadAll();
  }

  private updateFlightAvailability() {
    if (!this.selectedFlightId) {
      this.selectedFlightAvailable = false;
      console.log('No flight selected - availability set to false');
      return;
    }

    this.flights$.subscribe(flights => {
      const flightIdNumber = Number(this.selectedFlightId);
      const selectedFlight = flights.find(f => f.id === flightIdNumber);
      this.selectedFlightAvailable = selectedFlight ? selectedFlight.availableSeats > 0 : false;
      console.log('Updated flight availability for flight', flightIdNumber, ':', this.selectedFlightAvailable, 'Available seats:', selectedFlight?.availableSeats);
    });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const bookingRequest: BookingRequest = {
        flightId: Number(this.bookingForm.value.flightId),
        customerId: Number(this.bookingForm.value.customerId),
        price: Number(this.bookingForm.value.price)
      };
      console.log('Submitting booking request:', bookingRequest);
      this.bookingService.createBooking(bookingRequest);
      this.bookingForm.reset();
      this.selectedFlightId = null;
      this.selectedFlightAvailable = false;
    }
  }

  searchCustomerBookings() {
    if (this.searchCustomerId) {
      this.bookingService.getBookingsByCustomer(this.searchCustomerId).subscribe({
        next: (bookings) => this.customerBookings = bookings,
        error: (error) => {
          console.error('Error fetching customer bookings:', error);
          this.customerBookings = [];
        }
      });
    }
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId);
    }
  }
} 