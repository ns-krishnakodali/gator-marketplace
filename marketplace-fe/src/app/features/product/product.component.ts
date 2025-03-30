import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import { DisplayImagesComponent, ProductDetailsComponent } from './components/'
import type { ProductDetails } from './models'
import { ProductService } from './services'

import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    NavbarComponent,
    DisplayImagesComponent,
    ProductDetailsComponent,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  isLoading$: Observable<boolean>

  productId!: string | null
  productDetails!: ProductDetails

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {
    this.isLoading$ = this.productService.isLoading$
  }

  ngOnInit(): void {
    this.productService.productDetails$.subscribe((data) => {
      this.productDetails = data.productDetails
    })

    this.productId = this.route.snapshot.paramMap.get('productId')!
    this.productService.getProductDetails(this.productId)
  }
}
