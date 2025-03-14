import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import { APIService } from '../../../../core'
import { NotificationsService } from '../../../../shared-ui'
import {
  FILL_ALL_FORM_FIELDS,
  INVALID_EMAIL_ADDRESS,
  INVALID_UFL_EMAIL,
  PASSWORDS_DO_NOT_MATCH,
  validateEmail,
  validateUFLDomain,
} from '../../../../utils'

import type { SignupData } from '../../models/signup.model'

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  public isLoading$ = this.isLoadingSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  handleUserSignup = (signupData: SignupData): void => {
    this.isLoadingSubject.next(true)
    const inputsValidation = this.validateSignupData(signupData)
    if (!inputsValidation.isValid) {
      this.notificationsService.addNotification({
        message: inputsValidation.message,
        type: 'error',
      })
      this.isLoadingSubject.next(false)
      return
    }

    this.isLoadingSubject.next(true)
    this.apiService
      .post('signup', {
        name: signupData.name,
        email: signupData.email,
        mobile: signupData.mobileNumber,
        password: signupData.password,
      })
      .subscribe({
        next: () => {
          this.notificationsService.addNotification({
            message: 'Signup successful!',
            type: 'success',
          })
          this.router.navigate(['/auth/login'])
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

  handleOnLogin = (): void => {
    this.router.navigate(['/auth/login'])
  }

  private validateSignupData = (signupData: SignupData): { isValid: boolean; message: string } => {
    const name = signupData?.name?.trim()
    const email = signupData?.email?.trim()
    const password = signupData?.password
    const confirmPassword = signupData?.confirmPassword

    if (!name || !email || !password || !confirmPassword) {
      return { isValid: false, message: FILL_ALL_FORM_FIELDS }
    } else if (validateEmail(email) === false) {
      return { isValid: false, message: INVALID_EMAIL_ADDRESS }
    } else if (validateUFLDomain(email) === false) {
      return { isValid: false, message: INVALID_UFL_EMAIL }
    } else if (password !== confirmPassword) {
      return { isValid: false, message: PASSWORDS_DO_NOT_MATCH }
    }

    return { isValid: true, message: '' }
  }
}
