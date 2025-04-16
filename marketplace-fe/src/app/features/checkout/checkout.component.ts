import { Component } from '@angular/core'

import { HeadingComponent, NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-checkout',
  imports: [HeadingComponent, NavbarComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  readonly isLinear = false
}
