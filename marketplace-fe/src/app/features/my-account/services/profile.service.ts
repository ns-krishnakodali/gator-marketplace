import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { AccountDetails } from '../models/'
import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { IMAGE_UPLOAD_ERROR_MESSAGE, INVALID_EMAIL_ADDRESS, INVALID_UFL_EMAIL, validateEmail, validateUFLDomain } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly DEFAULT_DP: string = 'assets/profile-icon.png'
  private readonly DEFAULT_ACCOUNT_DETAILS: AccountDetails = {
    displayPictureSrc: this.DEFAULT_DP,
    name: '',
    displayName: '',
    email: '',
    mobileNumber: '',
  }

  private areLoadingAccountDetailsSubject = new BehaviorSubject<boolean>(false)
  private areUpdatingAccountDetails = new BehaviorSubject<boolean>(false)
  private isUploadingImageSubject = new BehaviorSubject<boolean>(false)
  private userDetailsSubject = new BehaviorSubject<AccountDetails>(this.DEFAULT_ACCOUNT_DETAILS)

  public areLoadingAccountDetails$ = this.areLoadingAccountDetailsSubject.asObservable()
  public areUpdatingAccountDetails$ = this.areUpdatingAccountDetails.asObservable()
  public isUploadingImage$ = this.isUploadingImageSubject.asObservable()
  public userDetails$ = this.userDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

  updateDisplayPicture = (file: File): Promise<string> => {
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

  getAccountDetails = (): void => {
    this.areLoadingAccountDetailsSubject.next(true)
    this.apiService.get('api/account-details').subscribe({
      next: (response: unknown) => {
        const userData: AccountDetails = this.processAccountDetails(response)
        console.log(userData)
        this.userDetailsSubject.next(userData)
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.areLoadingAccountDetailsSubject.next(false)
      },
      complete: () => {
        this.areLoadingAccountDetailsSubject.next(false)
      },
    })
  }

  updateAccountDetails = (accountDetails: AccountDetails): void => {
    if (!this.validateAccountDetails(accountDetails)) {
      return
    }
    this.areUpdatingAccountDetails.next(true)
  }

  getDisplayPictureStatus = (displayPictureSrc: string): boolean =>
    typeof displayPictureSrc === 'undefined' || displayPictureSrc === this.DEFAULT_DP

  private processAccountDetails = (response: unknown): AccountDetails => {
    const data = (response as { accountDetails: never })?.accountDetails
    if (!data) {
      return this.DEFAULT_ACCOUNT_DETAILS
    }

    return {
      displayPictureSrc: data?.['imageUrl'] || this.DEFAULT_DP,
      name: data?.['name'],
      displayName: data?.['displayName'],
      email: data?.['email'],
      mobileNumber: data?.['mobile'],
    }
  }

  private validateAccountDetails = (
    accountDetails: AccountDetails
  ): { isValid: boolean; message: string } => {
    if (validateEmail(accountDetails?.email) === false) {
      return { isValid: false, message: INVALID_EMAIL_ADDRESS }
    } else if (validateUFLDomain(accountDetails?.email) === false) {
      return { isValid: false, message: INVALID_UFL_EMAIL }
    } else if(accountDetails?.displayName && accountDetails?.displayName === '') {
      return { isValid: false, message: INVALID_UFL_EMAIL }
    } else if(accountDetails?.mobileNumber && accountDetails?.mobileNumber === '') {
      return { isValid: false, message: INVALID_UFL_EMAIL }
    }

    return { isValid: true, message: '' }
  }
}
