import { Component, Input } from '@angular/core'
import { CurrencyPipe } from '@angular/common'

import { MatTooltipModule } from '@angular/material/tooltip'

import type { CheckoutProductDetail } from '../../models'
import { HeadingComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-order-details',
  imports: [MatTooltipModule, CurrencyPipe, HeadingComponent, TextComponent],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent {
  @Input({ required: true }) checkoutProductDetails!: CheckoutProductDetail[]
  @Input({ required: true }) subTotal!: number
  @Input({ required: true }) handlingFee!: number
  @Input({ required: true }) totalPrice!: number
}
