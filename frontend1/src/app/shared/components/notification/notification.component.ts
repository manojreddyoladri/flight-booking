import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notificationService.notifications$ | async; trackBy: trackByFn"
        class="alert alert-{{ getAlertClass(notification.type) }} alert-dismissible fade show"
        role="alert">
        {{ notification.message }}
        <button 
          type="button" 
          class="btn-close" 
          (click)="removeNotification(notification)"
          aria-label="Close">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 400px;
    }
    
    .alert {
      margin-bottom: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}

  getAlertClass(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  removeNotification(notification: Notification) {
    this.notificationService.removeNotification(notification);
  }

  trackByFn(index: number, notification: Notification): string {
    return notification.message + index;
  }
} 