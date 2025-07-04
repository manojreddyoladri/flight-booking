import { Routes } from '@angular/router';
import { FlightsComponent } from './components/flights/flights.component';

export const routes: Routes = [
  { path: '', redirectTo: 'flights', pathMatch: 'full' },
  { path: 'flights', component: FlightsComponent }
];
