import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking, BookingRequest } from '../models/booking.model';
import { FlightService } from './flight.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://localhost:8080/api/bookings';
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private flightService: FlightService
  ) {}

  createBooking(bookingRequest: BookingRequest): void {
    console.log('Creating booking:', bookingRequest);
    this.http.post<Booking>(this.baseUrl, bookingRequest)
      .pipe(
        catchError(error => {
          console.error('Error creating booking:', error);
          let errorMessage = 'Failed to create booking';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Invalid booking request';
          } else if (error.status === 404) {
            errorMessage = 'Flight or customer not found';
          }
          alert(errorMessage);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (newBooking) => {
          console.log('Booking created successfully:', newBooking);
          const currentBookings = this.bookingsSubject.value;
          this.bookingsSubject.next([...currentBookings, newBooking]);
          // Refresh flight list to update seat availability
          console.log('Refreshing flight data after booking creation...');
          this.flightService.loadAll();
          alert('Booking created successfully!');
        },
        error: (error) => {
          console.error('Error in booking subscription:', error);
        }
      });
  }

  getBookingsByCustomer(customerId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  cancelBooking(bookingId: number): void {
    console.log('Cancelling booking:', bookingId);
    this.http.delete(`${this.baseUrl}/${bookingId}`)
      .pipe(
        catchError(error => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking');
          return throwError(() => error);
        })
      )
      .subscribe({
        next: () => {
          console.log('Booking cancelled successfully');
          const currentBookings = this.bookingsSubject.value;
          const updatedBookings = currentBookings.filter(b => b.id !== bookingId);
          this.bookingsSubject.next(updatedBookings);
          // Refresh flight list to update seat availability
          console.log('Refreshing flight data after booking cancellation...');
          this.flightService.loadAll();
          alert('Booking cancelled successfully!');
        },
        error: (error) => {
          console.error('Error in cancellation subscription:', error);
        }
      });
  }

  /** Fetch all bookings from the server into the subject */
  loadAll(): void {
    console.log('Loading all bookings...');
    this.http.get<Booking[]>(this.baseUrl)
      .subscribe({
        next: bookings => {
          console.log('Bookings loaded:', bookings);
          this.bookingsSubject.next(bookings);
        },
        error: err => {
          console.error('Error loading bookings:', err);
        }
      });
  }
} 