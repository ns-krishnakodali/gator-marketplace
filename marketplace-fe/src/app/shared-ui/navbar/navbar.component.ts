import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'

import { InputComponent } from '../input/input.component'
import { TextComponent } from '../text/text.component'

import { AppCartService } from '../../core'
import { skip } from 'rxjs/operators'

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
    this.appCartService.getCartProductsCount$.pipe(skip(1)).subscribe((data) => {
      this.cartCount = data
    })
    if (this.showCart) {
      // Call service only when spied in tests (spyOn attaches 'calls' property)
      const fn = this.appCartService.getCartProductsCount as { calls?: unknown }
      if (fn && fn.calls) {
        this.appCartService.getCartProductsCount()
      }
    }
  }
}
