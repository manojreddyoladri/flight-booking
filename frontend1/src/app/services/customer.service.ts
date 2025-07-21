import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Customer } from '../models/customer.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = environment.apiUrl + '/customers';

  constructor(private http: HttpClient) {}

  loadAllCustomers(): Observable<Customer[]> {
    console.log('Loading all customers...');
    return this.http.get<Customer[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error loading customers:', error);
        return throwError(() => new Error('Failed to load customers'));
      })
    );
  }

  createCustomer(customer: Customer): Observable<Customer> {
    console.log('Creating customer:', customer);
    return this.http.post<Customer>(this.baseUrl, customer).pipe(
      catchError(error => {
        console.error('Error creating customer:', error);
        return throwError(() => new Error('Failed to create customer'));
      })
    );
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching customer:', error);
        return throwError(() => new Error('Failed to fetch customer'));
      })
    );
  }
} 