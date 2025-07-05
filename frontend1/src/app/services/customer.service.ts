import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = 'http://localhost:8080/api/customers';
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  public customers$ = this.customersSubject.asObservable();

  constructor(private http: HttpClient) {}

  add(customer: Customer): void {
    this.http.post<Customer>(this.baseUrl, customer)
      .subscribe({
        next: (newCustomer) => {
          const currentCustomers = this.customersSubject.value;
          this.customersSubject.next([...currentCustomers, newCustomer]);
        },
        error: (error) => console.error('Error adding customer:', error)
      });
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }
} 