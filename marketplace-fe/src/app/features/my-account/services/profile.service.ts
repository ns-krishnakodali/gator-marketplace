import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { IMAGE_UPLOAD_ERROR_MESSAGE } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private isUploadingImageSubject = new BehaviorSubject<boolean>(false)
  public isUploadingImage$ = this.isUploadingImageSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

  uploadDisplayPicture = (file: File): Promise<string> => {
    this.isUploadingImageSubject.next(true)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.isUploadingImageSubject.next(false)
        resolve(e.target?.result as string)
      }
      reader.onerror = (error) => {
        this.isUploadingImageSubject.next(false)
        console.error('Error reading image file:', error)
        this.notificationsService.addNotification({
          type: 'error',
          message: IMAGE_UPLOAD_ERROR_MESSAGE,
        })
        reject(error)
      }
      reader.readAsDataURL(file)
    })
  }
}
