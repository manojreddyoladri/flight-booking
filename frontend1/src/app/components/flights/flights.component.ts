import { Component, OnInit } from '@angular/core';
import { FlightService } from '../../services/flight.service';
import { Flight } from '../../models/flight.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Flights</h2>
      <div class="mb-3">
        <button class="btn btn-secondary" (click)="refreshFlights()">Refresh Flight Data</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input formControlName="airlineName" placeholder="Airline Name" class="form-control mb-2" />
        <input formControlName="totalSeats" type="number" placeholder="Total Seats" class="form-control mb-2" />
        <button class="btn btn-primary" type="submit">Add Flight</button>
      </form>
      <ul class="list-group mt-3">
        <li *ngFor="let f of flightState$ | async" class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ f.airlineName }}</strong>
              <br>
              <small>Total Seats: {{ f.totalSeats }} | Available: {{ f.availableSeats }}</small>
            </div>
            <div>
              <span class="badge" [ngClass]="f.availableSeats > 0 ? 'bg-success' : 'bg-danger'">
                {{ f.availableSeats > 0 ? 'Available' : 'Full' }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class FlightsComponent implements OnInit {
    flightState$: Observable<Flight[]>;
    form: FormGroup;
  
    constructor(
      private flightService: FlightService,
      private fb: FormBuilder
    ) {
      this.flightState$ = this.flightService.flights$;
      this.form = this.fb.group({ airlineName: [''], totalSeats: [0] });
    }
  
    ngOnInit() {
      this.flightService.loadAll();
    }
  
    onSubmit() {
      this.flightService.add(this.form.value);
      this.form.reset();
    }

    refreshFlights() {
      console.log('Manual refresh triggered');
      this.flightService.loadAll();
    }
}