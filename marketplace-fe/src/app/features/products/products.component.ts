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
  isLoading$: Observable<boolean>
  productsData: ProductData[] = []
  totalItems!: number
  defaultPageSize = 12
  pageIndex = 1

  private categories: string[] = []
  private sortOption!: string

  constructor(private productsService: ProductsService) {
    this.isLoading$ = this.productsService.isLoading$
  }

  ngOnInit(): void {
    this.productsService.productsData$.subscribe((data) => {
      this.productsData = data.productsData
      this.totalItems = data.totalItems
    })
    this.productsService.getProductsData(this.pageIndex, this.defaultPageSize)
  }

  onPageChange = (event: { pageIndex: number }): void => {
    this.pageIndex = event.pageIndex + 1
    this.fetchProductsData()
  }

  onCategoryChange = (categories: string[]): void => {
    this.categories = categories
    this.pageIndex = 1
    this.fetchProductsData()
  }

  onSortOptionChange = (sortOption: string): void => {
    this.sortOption = sortOption
    this.fetchProductsData()
  }

  private fetchProductsData = (): void => {
    this.productsService.getProductsData(
      this.pageIndex,
      this.defaultPageSize,
      this.categories,
      this.sortOption
    )
  }
}
