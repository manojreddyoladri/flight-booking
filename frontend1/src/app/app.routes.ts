import { Routes } from '@angular/router';
import { FlightsComponent } from './components/flights/flights.component';

export const routes: Routes = [
  { path: '', redirectTo: 'flights', pathMatch: 'full' },
  { path: 'flights', component: FlightsComponent },
  { path: 'customers', loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent) },
  { path: 'bookings', loadComponent: () => import('./components/bookings/bookings.component').then(m => m.BookingsComponent) },
  { path: 'reports', loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) }
];
