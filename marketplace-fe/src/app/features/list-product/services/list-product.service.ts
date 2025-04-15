import { Injectable } from '@angular/core'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { PRODUCT_IMAGES_LIMIT } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class ListProductService {
  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

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
}
