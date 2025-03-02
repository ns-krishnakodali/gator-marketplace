import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  constructor(private router: Router) {}

  navigateToLandingPage = (): void => {
    this.router.navigate(['/'])
  }
}
