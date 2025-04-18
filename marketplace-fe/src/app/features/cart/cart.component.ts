import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import { CartCardComponent, OrderSummaryCardComponent } from './components'
import type { CartDetails } from './models'
import { CartService } from './services'

import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-cart',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    RouterModule,
    NavbarComponent,
    CartCardComponent,
    OrderSummaryCardComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  isLoading$: Observable<boolean>

  cartDetails!: CartDetails

  constructor(private cartService: CartService) {
    this.isLoading$ = this.cartService.getCartItemsIsLoading$
  }

  ngOnInit(): void {
    this.cartService.cartDetails$.subscribe((data) => {
      this.cartDetails = data.cartDetails
    })

    this.cartService.getCartItems()
  }

  get isEmptyCart(): boolean {
    return (
      typeof this.cartDetails.cartProducts === 'undefined' ||
      this.cartDetails.cartProducts.length === 0
    )
  }
}
