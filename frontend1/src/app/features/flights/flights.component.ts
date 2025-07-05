import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlightStore } from './flight.store';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { Flight } from '../../models/flight.model';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  providers: [FlightStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h2>Flight Management</h2>
      
      <!-- Error Message -->
      <app-error-message 
        [error]="store.error$ | async" 
        [retryFn]="loadFlights.bind(this)">
      </app-error-message>
      
      <!-- Loading Spinner -->
      <app-loading-spinner 
        [isLoading]="store.loading$ | async" 
        message="Loading flights...">
      </app-loading-spinner>
      
      <!-- Flight Statistics -->
      <div class="row mb-4" *ngIf="!(store.loading$ | async)">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Flights</h5>
              <p class="card-text display-6">{{ store.flightsCount$ | async }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Available Flights</h5>
              <p class="card-text display-6">{{ (store.availableFlights$ | async)?.length || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Full Flights</h5>
              <p class="card-text display-6">{{ (store.fullFlights$ | async)?.length || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Available Seats</h5>
              <p class="card-text display-6">{{ store.totalAvailableSeats$ | async }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Add Flight Form -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Add New Flight</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="flightForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
                <label for="airlineName" class="form-label">Airline Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="airlineName" 
                  formControlName="airlineName" 
                  placeholder="Enter airline name"
                />
                <div *ngIf="flightForm.get('airlineName')?.invalid && flightForm.get('airlineName')?.touched" 
                     class="text-danger small">
                  Airline name is required
                </div>
              </div>
              <div class="col-md-6">
                <label for="totalSeats" class="form-label">Total Seats</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="totalSeats" 
                  formControlName="totalSeats" 
                  placeholder="Enter total seats"
                  min="1"
                />
                <div *ngIf="flightForm.get('totalSeats')?.invalid && flightForm.get('totalSeats')?.touched" 
                     class="text-danger small">
                  Total seats must be greater than 0
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              class="btn btn-primary mt-3" 
              [disabled]="flightForm.invalid || (store.loading$ | async)">
              Add Flight
            </button>
          </form>
        </div>
      </div>
      
      <!-- Flights List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>Available Flights</h5>
          <button 
            class="btn btn-secondary" 
            (click)="loadFlights()"
            [disabled]="store.loading$ | async">
            Refresh
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Airline</th>
                  <th>Total Seats</th>
                  <th>Available Seats</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let flight of store.flights$ | async">
                  <td>{{ flight.id }}</td>
                  <td>{{ flight.airlineName }}</td>
                  <td>{{ flight.totalSeats }}</td>
                  <td>{{ flight.availableSeats }}</td>
                  <td>
                    <span class="badge" [ngClass]="flight.availableSeats > 0 ? 'bg-success' : 'bg-danger'">
                      {{ flight.availableSeats > 0 ? 'Available' : 'Full' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div *ngIf="(store.flights$ | async)?.length === 0 && !(store.loading$ | async)" 
               class="text-center text-muted">
            No flights available
          </div>
        </div>
      </div>
    </div>
  `
})
export class FlightsComponent implements OnInit {
  flightForm: FormGroup;

  constructor(
    public store: FlightStore,
    private fb: FormBuilder
  ) {
    this.flightForm = this.fb.group({
      airlineName: ['', [Validators.required, Validators.minLength(2)]],
      totalSeats: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadFlights();
  }

  loadFlights() {
    this.store.loadFlights();
  }

  onSubmit() {
    if (this.flightForm.valid) {
      const flight: Flight = {
        id: 0, // Will be assigned by backend
        airlineName: this.flightForm.value.airlineName,
        totalSeats: this.flightForm.value.totalSeats,
        availableSeats: this.flightForm.value.totalSeats
      };
      
      this.store.addFlightEffect(flight);
      this.flightForm.reset();
    }
  }
} 