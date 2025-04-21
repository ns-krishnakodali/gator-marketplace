import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import type { AccountSection } from '../models'

import { removeAuthToken } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class MyAccountService {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  routeToSection = (renderedSection: AccountSection): void => {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: renderedSection },
      queryParamsHandling: 'merge',
    })
  }

  logoutUser = (): void => {
    removeAuthToken()
    this.router.navigate(['/auth/login'], { replaceUrl: true })
  }
}
