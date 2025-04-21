import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { ListingsComponent, ProfileComponent, OrdersComponent } from './components/'
import type { AccountSection } from './models'
import { MyAccountService } from './services'

import { HeadingComponent, NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-my-account',
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    HeadingComponent,
    NavbarComponent,
    ListingsComponent,
    ProfileComponent,
    OrdersComponent,
  ],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})
export class MyAccountComponent implements OnInit {
  renderedSection: AccountSection = 'profile'
  readonly validSections: AccountSection[] = ['profile', 'orders', 'listings']

  constructor(
    private myAccountService: MyAccountService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const section = params['section']
      if (this.validSections.includes(section)) {
        this.renderedSection = section as AccountSection
      } else {
        this.renderedSection = 'profile'
      }
    })
  }

  renderSection = (accountSection: AccountSection): void => {
    this.renderedSection = accountSection
    this.myAccountService.routeToSection(this.renderedSection)
  }

  handleLogout = (): void => {
    this.myAccountService.logoutUser()
  }
}
