import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'flights', pathMatch: 'full' },
  { path: 'flights', loadComponent: () => import('./features/flights/flights.component').then(m => m.FlightsComponent) },
  { path: 'customers', loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent) },
  { path: 'bookings', loadComponent: () => import('./features/bookings/bookings.component').then(m => m.BookingsComponent) },
  { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) }
];
