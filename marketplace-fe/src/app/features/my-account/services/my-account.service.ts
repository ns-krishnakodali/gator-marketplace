import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { removeAuthToken } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class MyAccountService {
  constructor(private router: Router) {}

  logoutUser = (): void => {
    removeAuthToken()
    this.router.navigate(['/auth/login'], { replaceUrl: true })
  }
}
