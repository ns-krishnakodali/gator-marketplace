import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type { ProductDetails } from '../models'
import { Categories } from '../../products/models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import {
  FILL_ALL_FORM_FIELDS,
  INVALID_CATEGORY,
  INVALID_QUANTITY,
  PRODUCT_IMAGES_LIMIT,
  PRODUCT_LISTING_SUCCESSFUL,
} from '../../../utils'

@Injectable({ providedIn: 'root' })
export class ListProductService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  public isLoading$ = this.isLoadingSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  public listProduct = (productDetails: ProductDetails, productImageDetails: File[]): void => {
    const productDetailsValidation = this.validateProductDetails(productDetails)
    if (!productDetailsValidation.isValid) {
      this.notificationsService.addNotification({
        message: productDetailsValidation.message,
        type: 'error',
      })
      return
    }

    const formData: FormData = new FormData()

    formData.append('name', productDetails.name)
    formData.append('description', productDetails.description)
    formData.append('price', productDetails.price.toString())
    formData.append('category', productDetails.category)
    formData.append('quantity', productDetails.quantity.toString())

    productImageDetails.forEach((imageFile) => {
      formData.append('files', imageFile)
    })

    this.isLoadingSubject.next(true)
    this.apiService.post('api/product', formData).subscribe({
      next: () => {
        this.notificationsService.addNotification({
          message: PRODUCT_LISTING_SUCCESSFUL,
          type: 'success',
        })
        this.router.navigate(['/'])
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

  public processImages = (
    imageFiles: File[],
    maxValue: number,
    currentImageCount: number,
    callbackImgPreview: (imageDataUrl: string) => void,
    callbackImgFile: (imageFile: File) => void
  ): void => {
    if (imageFiles.length > maxValue) {
      this.notificationsService.addNotification({ type: 'error', message: PRODUCT_IMAGES_LIMIT })
      return
    }
    imageFiles.slice(0, maxValue - currentImageCount)?.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          callbackImgPreview(reader.result as string)
          callbackImgFile(file)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  private validateProductDetails = (
    productDetails: ProductDetails
  ): { isValid: boolean; message: string } => {
    if (
      !productDetails?.name ||
      !productDetails?.description ||
      !productDetails?.price ||
      !productDetails?.category ||
      !productDetails?.quantity
    ) {
      return { isValid: false, message: FILL_ALL_FORM_FIELDS }
    } else if (!this.isValidCategory(productDetails.category)) {
      return { isValid: false, message: INVALID_CATEGORY }
    } else if (productDetails.quantity <= 0) {
      return { isValid: false, message: INVALID_QUANTITY }
    }

    return { isValid: true, message: '' }
  }

  private isValidCategory = (category: string): boolean =>
    Object.values(Categories)
      .map((pCategory) => pCategory.toLocaleLowerCase())
      .includes(category.toLocaleLowerCase())
}
