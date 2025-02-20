import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  constructor(private router: Router) {}

  navigateTo = (path: string): void => {
    this.router.navigate([path])
  }
}
