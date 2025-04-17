import { Component, OnInit } from '@angular/core'
import { CurrencyPipe } from '@angular/common'

import type { OrderProductDetail } from '../../models'
import { HeadingComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-order-details',
  imports: [CurrencyPipe, HeadingComponent, TextComponent],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent implements OnInit {
  orderProductDetails!: OrderProductDetail[]
  subTotal!: number
  handlingFee!: number
  total!: number

  ngOnInit(): void {
    this.orderProductDetails = [
      { quantity: 1, name: 'Study Lamp', totalPrice: 20 },
      { quantity: 1, name: 'Study Lamp', totalPrice: 20 },
    ]
    this.subTotal = 20
    this.handlingFee = 5
    this.total = 25
  }
}
