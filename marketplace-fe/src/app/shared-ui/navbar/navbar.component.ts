import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'

import { InputComponent } from '../input/input.component'
import { TextComponent } from '../text/text.component'

import { AppCartService } from '../../core'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, InputComponent, TextComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Input() showAccount = false
  @Input() showCart = false
  @Input() showSearchBar = false

  cartCount!: string

  constructor(private appCartService: AppCartService) {}

  ngOnInit(): void {
    this.appCartService.getCartProductsCount$.subscribe((data) => {
      this.cartCount = data
    })

    if (this.showCart) {
      this.appCartService.getCartProductsCount()
    }
  }
}
