import { Component } from '@angular/core'

import { NavbarComponent } from '../../shared-ui'

import { ProfileComponent, OrdersComponent, PaymentsComponent } from './components/'
import type { AccountSection } from './models'

@Component({
  selector: 'app-my-account',
  imports: [NavbarComponent, ProfileComponent, OrdersComponent, PaymentsComponent],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})
export class MyAccountComponent {
  renderedSection: AccountSection = 'profile'

  renderSection = (accountSection: AccountSection): void => {
    this.renderedSection = accountSection
  }
}
