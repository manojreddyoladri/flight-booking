import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlightStore } from './flight.store';
import { FlightService } from '../../services/flight.service';
import { Flight } from '../../models/flight.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlightStore]
})
export class FlightsComponent implements OnInit {
  private flightStore = inject(FlightStore);
  private flightService = inject(FlightService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  // Observables
  flights$ = this.flightStore.flights$;
  loading$ = this.flightStore.loading$;
  error$ = this.flightStore.error$;
  availableFlights$ = this.flightStore.availableFlights$;
  fullFlights$ = this.flightStore.fullFlights$;
  totalAvailableSeats$ = this.flightStore.totalAvailableSeats$;
  flightsCount$ = this.flightStore.flightsCount$;

  // Form
  flightForm: FormGroup;
  isEditing = false;
  editingFlightId: number | null = null;

  // Search and filter properties
  searchAirline: string = '';
  searchDate: string = '';
  searchPrice: number | null = null;
  searchSeats: number | null = null;
  searchStatus: string = '';
  sortField: string = 'date';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor() {
    this.flightForm = this.fb.group({
      airlineName: ['', [Validators.required, Validators.minLength(2)]],
      totalSeats: [0, [Validators.required, Validators.min(1), Validators.max(500)]],
      flightDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.refreshFlights();
  }

  refreshFlights(): void {
    // Load flights from backend's current date
    this.flightStore.loadFutureFlightsToday();
  }

  onSubmit(): void {
    if (this.flightForm.valid) {
      const flightData = this.flightForm.value;
      
      if (this.isEditing && this.editingFlightId) {
        this.flightStore.updateFlightEffect({ id: this.editingFlightId, flight: flightData });
        this.notificationService.showSuccess('Flight updated successfully!');
      } else {
        this.flightStore.addFlightEffect(flightData);
        this.notificationService.showSuccess('Flight added successfully!');
      }
      
      this.resetForm();
    }
  }

  editFlight(flight: Flight): void {
    this.isEditing = true;
    this.editingFlightId = flight.id;
    this.flightForm.patchValue({
      airlineName: flight.airlineName,
      totalSeats: flight.totalSeats,
      flightDate: flight.flightDate,
      price: flight.price
    });
  }

  deleteFlight(flightId: number): void {
    if (confirm('Are you sure you want to delete this flight?')) {
      this.flightStore.deleteFlightEffect(flightId);
      this.notificationService.showSuccess('Flight deleted successfully!');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingFlightId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.flightForm.reset();
    this.isEditing = false;
    this.editingFlightId = null;
  }

  checkAvailability(flightId: number): void {
    this.flightService.checkAvailability(flightId).subscribe({
      next: (availableSeats) => {
        this.notificationService.showInfo(`Available seats: ${availableSeats}`);
      },
      error: () => {
        this.notificationService.showError('Failed to check availability');
      }
    });
  }

  // Advanced filtering methods
  applyFilters(): void {
    // For now, just refresh flights - filtering will be implemented in the store
    this.refreshFlights();
    this.notificationService.showInfo('Filters applied');
  }

  clearFilters(): void {
    this.searchAirline = '';
    this.searchDate = '';
    this.searchPrice = null;
    this.searchSeats = null;
    this.searchStatus = '';
    this.refreshFlights();
    this.notificationService.showInfo('Filters cleared');
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    // For now, just show a notification - sorting will be implemented in the store
    this.notificationService.showInfo(`Sorted by ${field} (${this.sortDirection})`);
  }

  exportFlights(): void {
    // Placeholder for export functionality
    this.notificationService.showInfo('Export functionality will be implemented in the next version');
    
    // In a real implementation, you would:
    // 1. Get the current filtered flights
    // 2. Convert to CSV/Excel format
    // 3. Trigger download
    // Example:
    // this.flightService.exportFlights(this.currentFilters).subscribe({
    //   next: (blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = 'flights-export.csv';
    //     link.click();
    //     window.URL.revokeObjectURL(url);
    //   }
    // });
  }
} 