import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { Categories } from '../../../products/models'
import { ProductDetails } from '../../models'

@Component({
  selector: 'app-list-product-form',
  imports: [FormsModule],
  templateUrl: './list-product-form.component.html',
  styleUrl: './list-product-form.component.css',
})
export class ListProductFormComponent {
  productDetails: ProductDetails = {
    name: '',
    description: '',
    price: 0,
    category: '',
    quantity: 1,
  }

  get categoryValues() {
    return Object.values(Categories)
  }
}
