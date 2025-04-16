import { CurrencyPipe } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import { ProductService } from '../../../product/services'

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
  imports: [CurrencyPipe, MatButtonModule],
})
export class OrderSummaryCardComponent {
  @Input({ required: true }) productsTotal!: string
  @Input({ required: true }) handlingFee!: string
  @Input({ required: true }) totalCost!: string

  constructor(private productServcice: ProductService) {}

  handleCheckout = (): void => {
    this.productServcice.handleCheckout()
  }
}
