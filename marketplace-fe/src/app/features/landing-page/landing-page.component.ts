import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import { LandingPageCardComponent } from './components/'
import { LandingPageService } from './services'
import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-landing-page',
  imports: [MatProgressSpinnerModule, CommonModule, LandingPageCardComponent, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit {
  isLoading$: Observable<boolean>

  constructor(private landingPageService: LandingPageService) {
    this.isLoading$ = this.landingPageService.isLoading$
  }

  ngOnInit(): void {
    this.landingPageService.callProtectedEndpoint()
  }

  onExploreMarketplaceClick = (): void => {
    this.landingPageService.navigateTo('/products')
  }

  onListProductsClick = (): void => {
    this.landingPageService.navigateTo('/list-product')
  }
}
