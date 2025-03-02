import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'

import { InputComponent } from '../input/input.component'
import { NavbarService } from './navbar.service'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, InputComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Input() showAccount = false
  @Input() showCart = false
  @Input() showSearchBar = false

  constructor(private navbarService: NavbarService) {}

  goToLandingPage = (): void => {
    this.navbarService.navigateToLandingPage()
  }
}
