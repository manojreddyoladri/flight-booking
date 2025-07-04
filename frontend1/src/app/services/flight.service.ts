import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Flight } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private baseUrl = 'http://localhost:8080/api/flights';
  private flightsSubject = new BehaviorSubject<Flight[]>([]);
  public flights$ = this.flightsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll(): void {
    this.http.get<Flight[]>(this.baseUrl)
      .subscribe({
        next: (flights) => this.flightsSubject.next(flights),
        error: (error) => console.error('Error loading flights:', error)
      });
  }

  add(flight: Flight): void {
    this.http.post<Flight>(this.baseUrl, flight)
      .subscribe({
        next: (newFlight) => {
          const currentFlights = this.flightsSubject.value;
          this.flightsSubject.next([...currentFlights, newFlight]);
        },
        error: (error) => console.error('Error adding flight:', error)
      });
  }
}