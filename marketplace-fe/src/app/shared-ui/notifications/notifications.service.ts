import { Injectable } from '@angular/core'

import type { INotification } from './notifications.model'

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications: INotification[] = []

  addNotification(notification: INotification): void {
    notification.id = Date.now()
    this.notifications.push(notification)

    if (notification.autoClose ?? true) {
      setTimeout(() => {
        this.removeNotification(notification.id!)
      }, 3000)
    }
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((notification) => notification.id !== id)
  }

  clearNotifications(): void {
    this.notifications = []
  }
}
