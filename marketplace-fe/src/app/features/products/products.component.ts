import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatPaginator } from '@angular/material/paginator'
import { Observable } from 'rxjs'

import { NavbarComponent } from '../../shared-ui'
import { SidebarComponent, DisplayProductsComponent } from './components'
import type { ProductData } from './models'
import { ProductsService } from './services'

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  imports: [
    MatPaginator,
    CommonModule,
    DisplayProductsComponent,
    NavbarComponent,
    SidebarComponent,
  ],
})
export class ProductsComponent implements OnInit {
  productsData: ProductData[] = []
  isLoading$: Observable<boolean>

  defaultPageSize = 12
  totalItems!: number

  constructor(private productsService: ProductsService) {
    this.isLoading$ = this.productsService.isLoading$
  }

  ngOnInit(): void {
    this.productsService.productsData$.subscribe((data) => {
      this.productsData = data.productsData
      this.totalItems = data.totalItems
    })
    this.productsService.getProductsData(1, this.defaultPageSize)
  }

  onPageChange(event: { pageIndex: number }): void {
    this.productsService.getProductsData(event.pageIndex + 1, this.defaultPageSize)
  }

  onCategoryChange = (categories: string[]): void => {
    this.productsService.getProductsData(1, this.defaultPageSize, categories)
  }

  onSortOptionChange = (sortOption: string): void => {
    this.productsService.getProductsData(1, this.defaultPageSize, [], sortOption)
  }
}
