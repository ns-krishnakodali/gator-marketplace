import { Component, Input } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { ProductData } from '../../models'
import { ProductCardComponent } from '../product-card/product-card.component'

import { HeadingComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-display-products',
  imports: [MatProgressSpinnerModule, ProductCardComponent, TextComponent, HeadingComponent],
  templateUrl: './display-products.component.html',
  styleUrl: './display-products.component.css',
})
export class DisplayProductsComponent {
  @Input({ required: true }) productsData!: ProductData[]
  @Input({ required: true }) isLoading!: boolean | null
}
