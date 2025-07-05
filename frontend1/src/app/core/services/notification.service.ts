import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  showSuccess(message: string, duration: number = 3000) {
    this.addNotification({ message, type: 'success', duration });
  }

  showError(message: string, duration: number = 5000) {
    this.addNotification({ message, type: 'error', duration });
  }

  showWarning(message: string, duration: number = 4000) {
    this.addNotification({ message, type: 'warning', duration });
  }

  showInfo(message: string, duration: number = 3000) {
    this.addNotification({ message, type: 'info', duration });
  }

  private addNotification(notification: Notification) {
    const currentNotifications = this.notificationsSubject.value;
    const newNotifications = [...currentNotifications, notification];
    this.notificationsSubject.next(newNotifications);

    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.duration);
    }
  }

  removeNotification(notification: Notification) {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n !== notification);
    this.notificationsSubject.next(filteredNotifications);
  }

  clearAll() {
    this.notificationsSubject.next([]);
  }
} 