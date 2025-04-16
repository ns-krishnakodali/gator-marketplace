import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { HeadingComponent, NavbarComponent } from '../../shared-ui'

import { ProfileComponent, OrdersComponent, PaymentsComponent } from './components/'
import type { AccountSection } from './models'
import { MyAccountService } from './services'

@Component({
  selector: 'app-my-account',
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    NavbarComponent,
    ProfileComponent,
    OrdersComponent,
    PaymentsComponent,
    HeadingComponent,
  ],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})
export class MyAccountComponent {
  renderedSection: AccountSection = 'profile'

  constructor(private myAccountService: MyAccountService) {}

  renderSection = (accountSection: AccountSection): void => {
    this.renderedSection = accountSection
  }

  handleLogout = (): void => {
    this.myAccountService.logoutUser()
  }
}
