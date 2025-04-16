import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type { ProductDetails, ProductResponseDTO, ProductImage, ProductImageDTO } from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'

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
        this.router.navigate(['/products'])
        this.isLoadingSubject.next(false)
      },
      complete: () => {
        this.isLoadingSubject.next(false)
      },
    })
  }

  handleCheckout = (): void => {
    this.router.navigate(['/checkout'])
  }

  private processProductDetailsResponse = (response: unknown): ProductDetails => {
    const productResponse = response as ProductResponseDTO

    return {
      pid: productResponse.pid || '',
      name: productResponse.name || '',
      description: productResponse.description || '',
      price: productResponse.price || 0,
      category: productResponse.category,
      postedBy: productResponse.postedBy || '',
      quantity: productResponse.quantity || 0,
      popularityScore: productResponse.popularityScore || 0,
      postedAt: productResponse.postedAt,
      productImages: this.getProductImages(productResponse.images),
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
