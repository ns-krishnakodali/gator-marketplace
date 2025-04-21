import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'

import type { ProductData } from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { PRODUCT_DETAILS_FETCH_ERROR, stringifyArray } from '../../../utils'

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  private productsDataSubject = new BehaviorSubject<{
    productsData: ProductData[]
    totalItems: number
  }>({ productsData: [], totalItems: 0 })

  public isLoading$ = this.isLoadingSubject.asObservable()
  public productsData$ = this.productsDataSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  getProductsData = (
    page: number,
    pageSize: number,
    categories?: string[],
    sortOption?: string
  ): void => {
    this.isLoadingSubject.next(true)
    this.apiService
      .get('api/products', {
        page,
        pageSize,
        categories: stringifyArray(categories),
        sort: sortOption || '',
      })
      .subscribe({
        next: (response: unknown) => {
          const productsData: ProductData[] = this.processProductsResponse(response)
          const totalItems: number = this.getTotalItems(response)

          this.productsDataSubject.next({
            productsData,
            totalItems,
          })
        },
        error: (error) => {
          this.notificationsService.addNotification({
            message: error.message,
            type: 'error',
          })
          this.isLoadingSubject.next(false)
        },
        complete: () => {
          this.isLoadingSubject.next(false)
        },
      })
  }

  openProductDetails = (productId: string): void => {
    this.router.navigate(['/product', productId]).then((success) => {
      if (!success) {
        this.notificationsService.addNotification({
          message: PRODUCT_DETAILS_FETCH_ERROR,
          type: 'error',
        })
      }
    })
  }

  private processProductsResponse = (response: unknown): ProductData[] => {
    const productsData = (response as { products: unknown })?.products

    if (!productsData || !Array.isArray(productsData)) {
      return []
    }

    return productsData.map((product) => ({
      pid: product.pid,
      userId: product.userUid,
      name: product.name,
      price: product.price,
      postedAt: product.postedAt,
      imageSrc: product.image?.url,
    }))
  }

  private getTotalItems = (response: unknown): number =>
    (response as { totalItems: number })?.totalItems || 0
}
