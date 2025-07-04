import { Component } from '@angular/core';
import { LoadingService } from '../loading.service'; // Adjust the path as needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: 
    `<div class="spinner-border text-primary" *ngIf="loadingService.isLoading()" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>`
  })
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}