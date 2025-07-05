import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h2>Customer Management</h2>
      
      <!-- Loading Spinner -->
      <app-loading-spinner 
        [isLoading]="loading$ | async" 
        message="Loading customers...">
      </app-loading-spinner>
      
      <!-- Error Message -->
      <app-error-message 
        [error]="error$ | async" 
        [retryFn]="loadCustomers.bind(this)">
      </app-error-message>
      
      <!-- Add Customer Form -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Add New Customer</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
                <label for="name" class="form-label">Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name" 
                  formControlName="name" 
                  placeholder="Enter customer name"
                />
                <div *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched" 
                     class="text-danger small">
                  Name is required
                </div>
              </div>
              <div class="col-md-6">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  formControlName="email" 
                  placeholder="Enter customer email"
                />
                <div *ngIf="customerForm.get('email')?.invalid && customerForm.get('email')?.touched" 
                     class="text-danger small">
                  Valid email is required
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              class="btn btn-primary mt-3" 
              [disabled]="customerForm.invalid || (loading$ | async)">
              Add Customer
            </button>
          </form>
        </div>
      </div>

      <!-- Search Customer -->
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
                [disabled]="!searchId || (loading$ | async)">
                Search Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Searched Customer -->
      <div class="card mb-4" *ngIf="searchedCustomer">
        <div class="card-header">
          <h5>Searched Customer</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <strong>Name:</strong> {{ searchedCustomer.name }}
            </div>
            <div class="col-md-6">
              <strong>Email:</strong> {{ searchedCustomer.email }}
            </div>
          </div>
        </div>
      </div>

      <!-- All Customers -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>All Customers</h5>
          <button 
            class="btn btn-secondary" 
            (click)="loadCustomers()"
            [disabled]="loading$ | async">
            Refresh
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of customers$ | async">
                  <td>{{ customer.id }}</td>
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.email }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div *ngIf="(customers$ | async)?.length === 0 && !(loading$ | async)" 
               class="text-center text-muted">
            No customers available
          </div>
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
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.customers$ = this.customerService.loadAllCustomers();
    this.loading$ = new Observable<boolean>();
    this.error$ = new Observable<string | null>();
    
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.loadAllCustomers().subscribe({
      next: () => {
        this.notificationService.showSuccess('Customers loaded successfully');
      },
      error: (error) => {
        this.notificationService.showError('Failed to load customers');
      }
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const customer: Customer = {
        id: 0, // Will be assigned by backend
        name: this.customerForm.value.name,
        email: this.customerForm.value.email
      };
      
      this.customerService.createCustomer(customer).subscribe({
        next: (newCustomer) => {
          this.notificationService.showSuccess('Customer created successfully!');
          this.customerForm.reset();
          this.loadCustomers(); // Refresh data
        },
        error: (error) => {
          this.notificationService.showError('Failed to create customer');
        }
      });
    }
  }

  searchCustomer() {
    if (this.searchId) {
      this.customerService.getCustomerById(this.searchId).subscribe({
        next: (customer: Customer) => {
          this.searchedCustomer = customer;
          this.notificationService.showSuccess('Customer found successfully');
        },
        error: (error: any) => {
          console.error('Error fetching customer:', error);
          this.searchedCustomer = null;
          this.notificationService.showError('Customer not found');
        }
      });
    }
  }
} 