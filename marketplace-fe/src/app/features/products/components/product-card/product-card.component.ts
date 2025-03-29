import { Component, Input } from '@angular/core'
import { DatePipe, CurrencyPipe } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatCard, MatCardContent } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

import { TextComponent } from '../../../../shared-ui/'
import { ProductsService } from '../../services'

@Component({
  selector: 'app-product-card',
  imports: [
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
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

  constructor(private productsService: ProductsService) {
  }

  onAddtoCart = (): void => {
    console.log('Added to cart: ', this.postedDate)
  }

  onCardClick = (): void => {
    this.productsService.openProductDetails(this.productId)
  }
}
