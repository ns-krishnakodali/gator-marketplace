import { Component, Input } from '@angular/core'
import { CommonModule, CurrencyPipe } from '@angular/common'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import type { CartProduct } from '../../models/'
import { CartService } from '../../services'
import { ButtonComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-cart-card',
  templateUrl: './cart-card.component.html',
  styleUrls: ['./cart-card.component.css'],
  imports: [MatProgressSpinnerModule, CommonModule, CurrencyPipe, TextComponent, ButtonComponent],
})
export class CartCardComponent {
  @Input({ required: true }) cartProduct!: CartProduct

  isRemoveItemLoading$: Observable<boolean>

  constructor(private cartService: CartService) {
    this.isRemoveItemLoading$ = this.cartService.removeCartProductIsLoading$
  }

  navigateToProductPage = (): void => {
    this.cartService.navigateToProductPage(this.cartProduct.productId)
  }

  onRemoveFromCart = (): void => {
    this.cartService.removeFromCart(this.cartProduct.productId)
  }

  adjustQuantity = (adjustment: number): void => {
    this.cartProduct.quantity = Math.max(
      0,
      Math.min(
        this.cartProduct.quantity + adjustment,
        Math.min(this.cartProduct.maxQuantity || 0, 10)
      )
    )

    this.cartService.updateCartProducts(this.cartProduct.productId, this.cartProduct.quantity)
  }
}
