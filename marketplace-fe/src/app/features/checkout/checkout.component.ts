import { Component, OnInit } from '@angular/core'

import { CheckoutDetailsComponent, OrderDetailsComponent, SafetyTipsComponent } from './components'

import { HeadingComponent, NavbarComponent } from '../../shared-ui'
import { CheckoutService } from './services'
import { CheckoutOrderDetails } from './models'
import { Observable } from 'rxjs'

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
