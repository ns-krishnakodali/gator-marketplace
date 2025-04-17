import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { CheckoutDetailsComponent, OrderDetailsComponent, SafetyTipsComponent } from './components'
import type { CheckoutOrderDetails } from './models'
import { CheckoutService } from './services'

import { HeadingComponent, NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-checkout',
  imports: [
    HeadingComponent,
    NavbarComponent,
    CheckoutDetailsComponent,
    OrderDetailsComponent,
    SafetyTipsComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  isLoading$: Observable<boolean>
  checkoutOrderDetails!: CheckoutOrderDetails

  constructor(private checkoutService: CheckoutService) {
    this.isLoading$ = this.checkoutService.getCheckoutDetailsIsLoading$
  }

  ngOnInit(): void {
    this.checkoutService.checkoutOrderDetails$.subscribe((data) => {
      this.checkoutOrderDetails = data.checkoutOrderDetails
    })

    this.checkoutService.getCheckoutDetails()
  }
}
