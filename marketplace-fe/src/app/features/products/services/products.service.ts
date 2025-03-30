import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { ProductData } from '../models'
import { stringifyArray } from '../../../utils'
import { Router } from '@angular/router'

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
          message: 'Failed to navigate to product details',
          type: 'error',
        })
      }
    })
  }

  private processProductsResponse = (response: unknown): ProductData[] => {
    const data = (response as { data: unknown })?.data

    if (!data || !Array.isArray(data)) {
      return []
    }

    return data.map((product) => ({
      pid: product.Pid,
      imageSrc: product.Images?.[0]?.Url,
      name: product.Name,
      price: product.Price,
      postDate: product.CreatedAt,
    }))
  }

  private getTotalItems = (response: unknown): number =>
    (response as { totalItems: number })?.totalItems || 0
}
