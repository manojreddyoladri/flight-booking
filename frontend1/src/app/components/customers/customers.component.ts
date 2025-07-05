import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
      <h2>Customer Management</h2>
      
      <!-- Customer Registration Form -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Register New Customer</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="name" 
                formControlName="name" 
                placeholder="Enter customer name"
              />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                formControlName="email" 
                placeholder="Enter customer email"
              />
            </div>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="!customerForm.valid"
            >
              Register Customer
            </button>
          </form>
        </div>
      </div>

      <!-- Customer Search -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Search Customer</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <input 
                type="number" 
                class="form-control" 
                placeholder="Enter Customer ID" 
                [(ngModel)]="searchId"
              />
            </div>
            <div class="col-md-6">
              <button 
                class="btn btn-info" 
                (click)="searchCustomer()"
                [disabled]="!searchId"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="card" *ngIf="searchedCustomer">
        <div class="card-header">
          <h5>Customer Details</h5>
        </div>
        <div class="card-body">
          <p><strong>ID:</strong> {{ searchedCustomer.id }}</p>
          <p><strong>Name:</strong> {{ searchedCustomer.name }}</p>
          <p><strong>Email:</strong> {{ searchedCustomer.email }}</p>
        </div>
      </div>

      <!-- Customer List -->
      <div class="card mt-4">
        <div class="card-header">
          <h5>All Customers</h5>
        </div>
        <div class="card-body">
          <ul class="list-group">
            <li *ngFor="let customer of customers$ | async" class="list-group-item">
              <strong>{{ customer.name }}</strong> ({{ customer.email }}) - ID: {{ customer.id }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  customers$: Observable<Customer[]>;
  customerForm: FormGroup;
  searchId: number | null = null;
  searchedCustomer: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customers$ = this.customerService.customers$;
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Load customers if needed
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const customer: Customer = {
        id: 0, // Will be assigned by backend
        name: this.customerForm.value.name,
        email: this.customerForm.value.email
      };
      this.customerService.add(customer);
      this.customerForm.reset();
    }
  }

  searchCustomer() {
    if (this.searchId) {
      this.customerService.getById(this.searchId).subscribe({
        next: (customer) => this.searchedCustomer = customer,
        error: (error) => {
          console.error('Error fetching customer:', error);
          this.searchedCustomer = null;
        }
      });
    }
  }
} 