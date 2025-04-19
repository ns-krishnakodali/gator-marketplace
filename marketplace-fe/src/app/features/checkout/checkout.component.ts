import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import { CheckoutDetailsComponent, OrderDetailsComponent, SafetyTipsComponent } from './components'
import type { CheckoutFrom, CheckoutOrderDetails } from './models'
import { CheckoutService } from './services'

import { HeadingComponent, NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-checkout',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
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
  checkoutFrom!: CheckoutFrom
  checkoutOrderDetails!: CheckoutOrderDetails
  pid!: string
  quantity!: string

  constructor(
    private checkoutService: CheckoutService,
    private route: ActivatedRoute
  ) {
    this.isLoading$ = this.checkoutService.getCheckoutDetailsIsLoading$
  }

  ngOnInit(): void {
    this.checkoutService.checkoutOrderDetails$.subscribe((data) => {
      this.checkoutOrderDetails = data.checkoutOrderDetails
    })

    this.checkoutFrom = this.route.snapshot.paramMap.get('checkoutFrom')! as CheckoutFrom
    this.pid = this.route.snapshot.queryParamMap.get('pid') || ''
    this.quantity = this.route.snapshot.queryParamMap.get('qty') || ''

    if (this.checkoutFrom === 'cart') this.checkoutService.getCheckoutCartDetails()
    else if (this.checkoutFrom === 'product') {
      this.checkoutService.getCheckoutProductDetails(this.pid, this.quantity)
    }
  }
}
