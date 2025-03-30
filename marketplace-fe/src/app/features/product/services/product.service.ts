import { Injectable } from '@angular/core'

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
    private notificationsService: NotificationsService
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

  private processProductDetailsResponse = (response: unknown): ProductDetails => {
    const productResponse = response as ProductResponseDTO

    return {
      pid: productResponse.Pid || '',
      name: productResponse.Name || '',
      description: productResponse.Description || '',
      price: productResponse.Price || 0,
      category: productResponse.Category,
      postedBy: productResponse.PostedBy || '',
      quantity: productResponse.Quantity || 0,
      PopularityScore: productResponse.PopularityScore || 0,
      postedAt: new Date(),
      updatedAt: new Date(),
      productImages: this.getProductImages(productResponse.Images),
    }
  }

  private getProductImages = (productImages: ProductImageDTO[]): ProductImage[] => {
    return (
      productImages?.map((image: ProductImageDTO) => ({
        isMain: image.IsMain || false,
        src: image.Url || '',
        mimeType: image.MimeType || '',
      })) || []
    )
  }
}
