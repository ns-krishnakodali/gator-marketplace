import { Component } from '@angular/core'

import { LandingPageCardComponent } from '../landing-page-card/landing-page-card.component'
import { LandingPageService } from '../../services'

@Component({
  selector: 'app-landing-page',
  imports: [LandingPageCardComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  constructor(private landingPageService: LandingPageService) {}

  onExploreMarketplaceClick = (): void => {
    this.landingPageService.navigateTo('/marketplace')
  }

  onListProductsClick = (): void => {
    this.landingPageService.navigateTo('/list-product')
  }
}
