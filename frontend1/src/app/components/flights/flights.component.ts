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
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input formControlName="airlineName" placeholder="Airline Name" class="form-control mb-2" />
        <input formControlName="totalSeats" type="number" placeholder="Total Seats" class="form-control mb-2" />
        <button class="btn btn-primary" type="submit">Add Flight</button>
      </form>
      <ul class="list-group mt-3">
        <li *ngFor="let f of flightState$ | async" class="list-group-item">
          {{ f.airlineName }} (Seats: {{ f.totalSeats }})
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
}