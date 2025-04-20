import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type { ProductDetails, ProductResponseDTO, ProductImage, ProductImageDTO } from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { TO_CHECKOUT_FAILED } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class ProductService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  private productDetailsSubject = new BehaviorSubject<{
    productDetails: ProductDetails
  }>({ productDetails: {} as ProductDetails })

  public isLoading$ = this.isLoadingSubject.asObservable()
  public productDetails$ = this.productDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  getProductDetails = (productId: string) => {
    this.isLoadingSubject.next(true)
    this.apiService.get(`api/product/${productId}`).subscribe({
      next: (response: unknown) => {
        const productDetails: ProductDetails = this.processProductDetailsResponse(response)
        this.productDetailsSubject.next({
          productDetails,
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

  handleProductCheckout = (productId: string, quantity: number): void => {
    this.router
      .navigate(['/checkout', 'product'], { queryParams: { pid: productId, qty: quantity } })
      .then((success) => {
        if (!success) {
          this.notificationsService.addNotification({
            message: TO_CHECKOUT_FAILED,
            type: 'error',
          })
        }
      })
  }

  private processProductDetailsResponse = (response: unknown): ProductDetails => {
    const productDetailsResponse = response as ProductResponseDTO
    return {
      pid: productDetailsResponse.pid || '',
      name: productDetailsResponse.name || '',
      description: productDetailsResponse.description || '',
      price: productDetailsResponse.price || 0,
      category: productDetailsResponse.category,
      postedBy: productDetailsResponse.postedBy || '',
      quantity: productDetailsResponse.quantity || 0,
      popularityScore: productDetailsResponse.popularityScore || 0,
      postedAt: productDetailsResponse.postedAt,
      productImages: this.getProductImages(productDetailsResponse.images),
    }
  }

  private getProductImages = (productImages: ProductImageDTO[]): ProductImage[] => {
    return (
      productImages?.map((image: ProductImageDTO) => ({
        isMain: image.isMain || false,
        src: image.url || '',
        mimeType: image.mimeType || '',
      })) || []
    )
  }
}
