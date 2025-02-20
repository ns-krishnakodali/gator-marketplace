import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { isValidToken } from '../../../../utils'

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  constructor(private router: Router) {}

  checkTokenValidation = (): void => {
    if (!isValidToken()) {
      this.router.navigate(['/auth/login'])
    }
  }

  navigateTo = (path: string): void => {
    this.router.navigate([path])
  }
}
