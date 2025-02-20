import { Component } from '@angular/core'

import { LandingPageCardComponent } from '../landing-page-card/landing-page-card.component'
import { LandingPageService } from '../../services'
import { NavbarComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-landing-page',
  imports: [LandingPageCardComponent, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  navbarLinks = [
    {
      label: 'Account',
      path: '/',
    },
  ]
  constructor(private landingPageService: LandingPageService) {}

  onExploreMarketplaceClick = (): void => {
    this.landingPageService.navigateTo('/marketplace')
  }

  onListProductsClick = (): void => {
    this.landingPageService.navigateTo('/list-product')
  }
}
