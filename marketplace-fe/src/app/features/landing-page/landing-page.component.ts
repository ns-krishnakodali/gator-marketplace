import { Component, OnInit } from '@angular/core'

import { LandingPageCardComponent } from './components/'
import { LandingPageService } from './services'
import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-landing-page',
  imports: [LandingPageCardComponent, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit {
  constructor(private landingPageService: LandingPageService) {}

  ngOnInit(): void {
    this.landingPageService.checkTokenValidation()
  }

  onExploreMarketplaceClick = (): void => {
    this.landingPageService.navigateTo('/marketplace')
  }

  onListProductsClick = (): void => {
    this.landingPageService.navigateTo('/list-product')
  }
}
