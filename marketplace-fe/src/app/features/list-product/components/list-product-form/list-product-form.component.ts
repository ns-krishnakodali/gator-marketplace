import { Component } from '@angular/core'

import { Categories } from '../../../products/models'

@Component({
  selector: 'app-list-product-form',
  templateUrl: './list-product-form.component.html',
  styleUrl: './list-product-form.component.css',
})
export class ListProductFormComponent {
  get categoryValues() {
    return Object.values(Categories)
  }
}
