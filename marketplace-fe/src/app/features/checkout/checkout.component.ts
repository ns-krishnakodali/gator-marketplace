import { Component } from '@angular/core'

import { CheckoutDetailsComponent, OrderDetailsComponent, SafetyTipsComponent } from './components'

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
export class CheckoutComponent {
  readonly isLinear = true
}
