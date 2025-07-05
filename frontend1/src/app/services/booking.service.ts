import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Booking, BookingRequest } from '../models/booking.model';
import { FlightService } from './flight.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://localhost:8080/api/bookings';

  constructor(
    private http: HttpClient,
    private flightService: FlightService
  ) {}

  loadAllBookings(): Observable<Booking[]> {
    console.log('Loading all bookings...');
    return this.http.get<Booking[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error loading bookings:', error);
        return throwError(() => new Error('Failed to load bookings'));
      })
    );
  }

  createBooking(bookingRequest: BookingRequest): Observable<Booking> {
    console.log('Creating booking:', bookingRequest);
    return this.http.post<Booking>(this.baseUrl, bookingRequest).pipe(
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
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getBookingsByCustomer(customerId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/customer/${customerId}`).pipe(
      catchError(error => {
        console.error('Error fetching customer bookings:', error);
        return throwError(() => new Error('Failed to fetch customer bookings'));
      })
    );
  }

  cancelBooking(bookingId: number): Observable<void> {
    console.log('Cancelling booking:', bookingId);
    return this.http.delete<void>(`${this.baseUrl}/${bookingId}`).pipe(
      catchError(error => {
        console.error('Error cancelling booking:', error);
        return throwError(() => new Error('Failed to cancel booking'));
      })
    );
  }
} 