import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'

import type { OrderStatus } from './order-status.model'

@Component({
  selector: 'app-order-status',
  imports: [CommonModule],
  templateUrl: './order-status.component.html',
  styleUrl: './order-status.component.css',
})
export class OrderStatusComponent {
  @Input() id!: string
  @Input() includeStatus = false
  @Input({ required: true }) orderStatus!: OrderStatus
}
