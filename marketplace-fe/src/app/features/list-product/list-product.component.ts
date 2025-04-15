import { Component, ViewChild } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'

import type { ProductDetails } from './models'
import { ListProductFormComponent, ProductImagesComponent } from './components'
import { ListProductService } from './services'

import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-list-product',
  imports: [MatButtonModule, NavbarComponent, ProductImagesComponent, ListProductFormComponent],
  templateUrl: './list-product.component.html',
  styleUrl: './list-product.component.css',
})
export class ListProductComponent {
  @ViewChild(ListProductFormComponent) listProductForm!: ListProductFormComponent
  @ViewChild(ProductImagesComponent) productImages!: ProductImagesComponent

  constructor(private listProductService: ListProductService) {}

  onListProduct = (event: Event): void => {
    event.preventDefault()
    if (this.listProductForm) {
      const productDetails: ProductDetails = this.listProductForm.productDetails
      const productImageFiles: File[] = this.productImages.imageFiles
      this.listProductService.listProduct(productDetails, productImageFiles)
    }
  }
}
