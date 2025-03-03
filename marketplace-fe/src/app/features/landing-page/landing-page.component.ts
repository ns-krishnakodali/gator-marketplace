import { Component } from '@angular/core'

import { LandingPageCardComponent } from './components/'
import { LandingPageService } from './services'
import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-landing-page',
  imports: [LandingPageCardComponent, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  constructor(private landingPageService: LandingPageService) {}

  onExploreMarketplaceClick = (): void => {
    this.landingPageService.navigateTo('/products')
  }

  onListProductsClick = (): void => {
    this.landingPageService.navigateTo('/list-product')
  }
}
