import { Component } from '@angular/core'
import { ProductCardComponent } from '../product-card/product-card.component'

@Component({
  selector: 'app-display-products',
  imports: [ProductCardComponent],
  templateUrl: './display-products.component.html',
  styleUrl: './display-products.component.css',
})
export class DisplayProductsComponent {}
