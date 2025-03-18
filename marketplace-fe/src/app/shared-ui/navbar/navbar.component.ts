import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NavbarService } from './navbar.service'
import { InputComponent } from '../input/input.component'
import { TextComponent } from '../text/text.component'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, InputComponent, TextComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Input() showAccount = false
  @Input() showCart = false
  @Input() showSearchBar = false

  itemsInCart = 0

  constructor(private navbarService: NavbarService) {}

  get itemsInCartValue() {
    return this.itemsInCart === 0 ? '' : `(${this.itemsInCart})`
  }
}
