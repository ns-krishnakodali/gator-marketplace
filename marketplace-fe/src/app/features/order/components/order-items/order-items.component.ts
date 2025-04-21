import { CurrencyPipe } from '@angular/common'
import { Component, Input } from '@angular/core'

import type { OrderItem } from '../../models'

import { TextComponent } from '../../../../shared-ui'
import { OrderService } from '../../services'

@Component({
  selector: 'app-order-items',
  imports: [CurrencyPipe, TextComponent],
  templateUrl: './order-items.component.html',
  styleUrl: './order-items.component.css',
})
export class OrderItemsComponent {
  @Input({ required: true }) orderItems!: OrderItem[]
  @Input({ required: true }) handlingFee!: number
  @Input({ required: true }) totalCost!: number

  constructor(private orderService: OrderService) {}

  openProductPage = (pid: string): void => {
    this.orderService.openProductDetails(pid)
  }
}
