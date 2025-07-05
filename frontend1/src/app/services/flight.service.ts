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

  addFlight(flight: Flight): Observable<Flight> {
    console.log('Adding flight:', flight);
    return this.http.post<Flight>(this.baseUrl, flight).pipe(
      catchError(error => {
        console.error('Error adding flight:', error);
        return throwError(() => new Error('Failed to add flight'));
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