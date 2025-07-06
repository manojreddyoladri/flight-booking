import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  getNotifications() {
    return this.notifications$.asObservable();
  }

  showSuccess(message: string): void {
    this.addNotification(message, 'success');
  }

  showError(message: string): void {
    this.addNotification(message, 'error');
  }

  showInfo(message: string): void {
    this.addNotification(message, 'info');
  }

  showWarning(message: string): void {
    this.addNotification(message, 'warning');
  }

  removeNotification(id: number): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
  }

  private addNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    const notification: Notification = {
      message,
      type,
      id: this.nextId++
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }
} 