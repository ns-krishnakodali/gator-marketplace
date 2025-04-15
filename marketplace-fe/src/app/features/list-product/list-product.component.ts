import { Component, ViewChild } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { ProductDetails } from './models'
import { ListProductFormComponent, ProductImagesComponent } from './components'
import { ListProductService } from './services'

import { NavbarComponent } from '../../shared-ui'
import { Observable } from 'rxjs'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-list-product',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    NavbarComponent,
    ProductImagesComponent,
    ListProductFormComponent,
  ],
  templateUrl: './list-product.component.html',
  styleUrl: './list-product.component.css',
})
export class ListProductComponent {
  @ViewChild(ListProductFormComponent) listProductForm!: ListProductFormComponent
  @ViewChild(ProductImagesComponent) productImages!: ProductImagesComponent

  isLoading$: Observable<boolean>

  constructor(private listProductService: ListProductService) {
    this.isLoading$ = this.listProductService.isLoading$
  }

  onListProduct = (event: Event): void => {
    event.preventDefault()
    if (this.listProductForm) {
      const productDetails: ProductDetails = this.listProductForm.productDetails
      const productImageFiles: File[] = this.productImages.imageFiles
      this.listProductService.listProduct(productDetails, productImageFiles)
    }
  }
}
