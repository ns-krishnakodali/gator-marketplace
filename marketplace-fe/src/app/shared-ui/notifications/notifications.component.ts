import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

import { TextComponent } from '../text/text.component'

import type { INotification } from './notifications.model'
import { NotificationsService } from './notifications.service'

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, TextComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  constructor(private notificationsService: NotificationsService) {}

  get notifications() {
    return this.notificationsService.notifications
  }

  addNotification(notification: INotification) {
    this.notificationsService.addNotification(notification)
  }

  removeNotification(id: number) {
    this.notificationsService.removeNotification(id)
  }
}
