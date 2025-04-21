import { CommonModule, DatePipe } from '@angular/common'
import { Component, Input } from '@angular/core'

import type { OrderSummary } from '../../models'
import { OrderStatusComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-order-summary',
  imports: [CommonModule, DatePipe, TextComponent, OrderStatusComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
})
export class OrderSummaryComponent {
  @Input({ required: true }) orderSummary!: OrderSummary
}
