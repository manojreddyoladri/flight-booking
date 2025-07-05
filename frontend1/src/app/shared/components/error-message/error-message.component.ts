import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="error" class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Error!</h4>
      <p>{{ error }}</p>
      <button *ngIf="retryFn" class="btn btn-outline-danger btn-sm" (click)="retryFn()">
        Try Again
      </button>
    </div>
  `
})
export class ErrorMessageComponent {
  @Input() error: string | null = null;
  @Input() retryFn?: () => void;
} 