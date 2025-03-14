import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  constructor(private router: Router) {}

  navigateToPage = (url: string): void => {
    this.router.navigate([url])
  }
}
