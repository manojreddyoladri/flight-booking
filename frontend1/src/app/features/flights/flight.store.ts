import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap, catchError, of } from 'rxjs';
import { Flight } from '../../models/flight.model';
import { FlightService } from '../../services/flight.service';

export interface FlightState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
}

const initialState: FlightState = {
  flights: [],
  loading: false,
  error: null
};

@Injectable()
export class FlightStore extends ComponentStore<FlightState> {
  
  // Selectors
  readonly flights$ = this.select(state => state.flights);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  
  // Computed selectors using Angular 18 computed functions
  readonly availableFlights$ = this.select(
    this.flights$,
    (flights) => flights.filter(flight => flight.availableSeats > 0)
  );
  
  readonly fullFlights$ = this.select(
    this.flights$,
    (flights) => flights.filter(flight => flight.availableSeats === 0)
  );
  
  readonly totalAvailableSeats$ = this.select(
    this.availableFlights$,
    (flights) => flights.reduce((total, flight) => total + flight.availableSeats, 0)
  );
  
  readonly flightsCount$ = this.select(
    this.flights$,
    (flights) => flights.length
  );

  // Updaters
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
    error: loading ? null : state.error
  }));

  readonly setError = this.updater((state, error: string) => ({
    ...state,
    error,
    loading: false
  }));

  readonly setFlights = this.updater((state, flights: Flight[]) => ({
    ...state,
    flights,
    loading: false,
    error: null
  }));

  readonly addFlight = this.updater((state, flight: Flight) => ({
    ...state,
    flights: [...state.flights, flight]
  }));

  readonly updateFlight = this.updater((state, updatedFlight: Flight) => ({
    ...state,
    flights: state.flights.map(flight => 
      flight.id === updatedFlight.id ? updatedFlight : flight
    )
  }));

  // Effects
  readonly loadFlights = this.effect((trigger$: Observable<void>) => 
    trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => this.flightService.loadAllFlights().pipe(
        tap(flights => this.setFlights(flights)),
        catchError(error => {
          this.setError(error.message || 'Failed to load flights');
          return of(null);
        })
      ))
    )
  );

  readonly addFlightEffect = this.effect((flight$: Observable<Flight>) =>
    flight$.pipe(
      switchMap(flight => this.flightService.addFlight(flight).pipe(
        tap(newFlight => this.addFlight(newFlight)),
        catchError(error => {
          this.setError(error.message || 'Failed to add flight');
          return of(null);
        })
      ))
    )
  );

  constructor(private flightService: FlightService) {
    super(initialState);
  }
} 