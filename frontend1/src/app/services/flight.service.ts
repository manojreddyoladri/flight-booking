import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Flight } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private baseUrl = 'http://localhost:8080/api/flights';

  constructor(private http: HttpClient) {}

  loadAllFlights(): Observable<Flight[]> {
    console.log('Loading all flights...');
    return this.http.get<Flight[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error loading flights:', error);
        return throwError(() => new Error('Failed to load flights'));
      })
    );
  }

  getFlightsByDate(date: string): Observable<Flight[]> {
    console.log('Loading flights for date:', date);
    return this.http.get<Flight[]>(`${this.baseUrl}/by-date?date=${date}`).pipe(
      catchError(error => {
        console.error('Error loading flights by date:', error);
        return throwError(() => new Error('Failed to load flights for selected date'));
      })
    );
  }

  getFutureFlights(fromDate: string): Observable<Flight[]> {
    console.log('Loading future flights from date:', fromDate);
    return this.http.get<Flight[]>(`${this.baseUrl}/future?fromDate=${fromDate}`).pipe(
      catchError(error => {
        console.error('Error loading future flights:', error);
        return throwError(() => new Error('Failed to load future flights'));
      })
    );
  }

  getFutureFlightsToday(): Observable<Flight[]> {
    console.log('Loading future flights from backend current date');
    return this.http.get<Flight[]>(`${this.baseUrl}/future-today`).pipe(
      catchError(error => {
        console.error('Error loading future flights (today):', error);
        return throwError(() => new Error('Failed to load future flights (today)'));
      })
    );
  }

  addFlight(flight: Flight): Observable<Flight> {
    console.log('Adding flight:', flight);
    return this.http.post<Flight>(this.baseUrl, flight).pipe(
      catchError(error => {
        console.error('Error adding flight:', error);
        return throwError(() => new Error('Failed to add flight'));
      })
    );
  }

  updateFlight(id: number, flight: Flight): Observable<Flight> {
    console.log('Updating flight:', id, flight);
    return this.http.put<Flight>(`${this.baseUrl}/${id}`, flight).pipe(
      catchError(error => {
        console.error('Error updating flight:', error);
        return throwError(() => new Error('Failed to update flight'));
      })
    );
  }

  deleteFlight(id: number): Observable<void> {
    console.log('Deleting flight:', id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting flight:', error);
        return throwError(() => new Error('Failed to delete flight'));
      })
    );
  }

  checkAvailability(flightId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${flightId}/availability`).pipe(
      catchError(error => {
        console.error('Error checking availability:', error);
        return throwError(() => new Error('Failed to check availability'));
      })
    );
  }

  refreshFlights(): Observable<Flight[]> {
    console.log('Refreshing flights...');
    return this.loadAllFlights();
  }
}