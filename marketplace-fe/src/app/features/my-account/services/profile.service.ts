import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { AccountDetails } from '../models/'
import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import {
  EMPTY_DISPLAY_NAME,
  EMPTY_MOBILE_NUMBER,
  EMPTY_PASSWORD_FIELDS,
  IMAGE_UPLOAD_ERROR_MESSAGE,
  INVALID_EMAIL_ADDRESS,
  INVALID_MOBILE_NUMBER,
  INVALID_UFL_EMAIL,
  isValidMobileNumber,
  SAME_PASSWORDS,
  UPDATE_DETAILS_SUCCESSFUL,
  UPDATE_PASSWORD_SUCCESSFUL,
  validateEmail,
  validateUFLDomain,
} from '../../../utils'

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly DEFAULT_DP_SRC: string = 'assets/profile-icon.png'
  private readonly DEFAULT_ACCOUNT_DETAILS: AccountDetails = {
    displayPictureSrc: this.DEFAULT_DP_SRC,
    name: '',
    displayName: '',
    email: '',
    mobileNumber: '',
  }

  private areLoadingAccountDetailsSubject = new BehaviorSubject<boolean>(false)
  private areUpdatingAccountDetails = new BehaviorSubject<boolean>(false)
  private isUpdatingUserPasswordSubject = new BehaviorSubject<boolean>(false)
  private isUploadingImageSubject = new BehaviorSubject<boolean>(false)
  private userDetailsSubject = new BehaviorSubject<AccountDetails>(this.DEFAULT_ACCOUNT_DETAILS)

  public areLoadingAccountDetails$ = this.areLoadingAccountDetailsSubject.asObservable()
  public areUpdatingAccountDetails$ = this.areUpdatingAccountDetails.asObservable()
  public isUpdatingUserPassword$ = this.isUpdatingUserPasswordSubject.asObservable()
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
    const inputsValidation = this.validateAccountDetails(accountDetails)
    if (!inputsValidation.isValid) {
      this.notificationsService.addNotification({
        message: inputsValidation.message,
        type: 'error',
      })
      return
    }
    this.areUpdatingAccountDetails.next(true)
    this.apiService
      .put('api/update-account', {
        name: accountDetails.name,
        displayName: accountDetails.displayName,
        email: accountDetails.email,
        mobile: accountDetails.mobileNumber,
      })
      .subscribe({
        next: () => {
          this.notificationsService.addNotification({
            message: UPDATE_DETAILS_SUCCESSFUL,
            type: 'success',
          })
          this.areUpdatingAccountDetails.next(false)
        },
        error: (error) => {
          this.notificationsService.addNotification({
            message: error.message,
            type: 'error',
          })
          this.areUpdatingAccountDetails.next(false)
        },
        complete: () => {
          this.areUpdatingAccountDetails.next(false)
        },
      })
  }

  updateAccountPassword = (currentPassword: string, newPassword: string): void => {
    const inputsValidation = this.validatePasswordDetails(currentPassword, newPassword)
    if (!inputsValidation.isValid) {
      this.notificationsService.addNotification({
        message: inputsValidation.message,
        type: 'error',
      })
      return
    }
    this.isUpdatingUserPasswordSubject.next(true)
    this.apiService
      .put('api/update-password', {
        currentPassword,
        newPassword,
      })
      .subscribe({
        next: () => {
          this.notificationsService.addNotification({
            message: UPDATE_PASSWORD_SUCCESSFUL,
            type: 'success',
          })
          this.isUpdatingUserPasswordSubject.next(false)
        },
        error: (error) => {
          this.notificationsService.addNotification({
            message: error.message,
            type: 'error',
          })
          this.isUpdatingUserPasswordSubject.next(false)
        },
        complete: () => {
          this.isUpdatingUserPasswordSubject.next(false)
        },
      })
  }

  getDisplayPictureStatus = (displayPictureSrc: string): boolean =>
    typeof displayPictureSrc === 'undefined' || displayPictureSrc === this.DEFAULT_DP_SRC

  private processAccountDetails = (response: unknown): AccountDetails => {
    const data = (response as { accountDetails: never })?.accountDetails
    if (!data) {
      return this.DEFAULT_ACCOUNT_DETAILS
    }

    return {
      displayPictureSrc: data?.['imageUrl'] || this.DEFAULT_DP_SRC,
      name: data?.['name'],
      displayName: data?.['displayName'],
      email: data?.['email'],
      mobileNumber: data?.['mobile'],
    }
  }

  private validateAccountDetails = (
    accountDetails: AccountDetails
  ): { isValid: boolean; message: string } => {
    if (!validateEmail(accountDetails?.email)) {
      return { isValid: false, message: INVALID_EMAIL_ADDRESS }
    } else if (!validateUFLDomain(accountDetails?.email)) {
      return { isValid: false, message: INVALID_UFL_EMAIL }
    } else if (accountDetails?.displayName && accountDetails?.displayName === '') {
      return { isValid: false, message: EMPTY_DISPLAY_NAME }
    } else if (accountDetails?.mobileNumber && accountDetails?.mobileNumber === '') {
      return { isValid: false, message: EMPTY_MOBILE_NUMBER }
    } else if (!isValidMobileNumber(accountDetails?.mobileNumber)) {
      return { isValid: false, message: INVALID_MOBILE_NUMBER }
    }

    return { isValid: true, message: '' }
  }

  private validatePasswordDetails = (
    currentPassword: string,
    newPassword: string
  ): { isValid: boolean; message: string } => {
    if (!currentPassword || !newPassword) {
      return { isValid: false, message: EMPTY_PASSWORD_FIELDS }
    }
    if (currentPassword === '' || newPassword === '') {
      return { isValid: false, message: EMPTY_PASSWORD_FIELDS }
    } else if (currentPassword === newPassword) {
      return { isValid: false, message: SAME_PASSWORDS }
    }

    return { isValid: true, message: '' }
  }
}
