import { Component, Input } from '@angular/core'
import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatCard, MatCardContent } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { finalize } from 'rxjs'

import { ProductsService } from '../../services'
import { TextComponent } from '../../../../shared-ui/'
import { AppCartService } from '../../../../core/'

@Component({
  selector: 'app-product-card',
  imports: [
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DatePipe,
    CommonModule,
    TextComponent,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() imageSrc!: string
  @Input() productName!: string
  @Input() productPrice!: number
  @Input() postedDate!: string
  @Input() productId!: string
  @Input() class?: string

  addToCartLoading = false

  constructor(
    private productsService: ProductsService,
    private appCartService: AppCartService
  ) {}

  addtoCart = (event: Event): void => {
    event.stopPropagation()
    this.addToCartLoading = true

    this.appCartService
      .addToCart(this.productId)
      .pipe(finalize(() => (this.addToCartLoading = false)))
      .subscribe()
  }

  onCardClick = (): void => {
    this.productsService.openProductDetails(this.productId)
  }
}
