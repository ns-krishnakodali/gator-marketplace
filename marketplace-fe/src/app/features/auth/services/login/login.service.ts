import { Injectable } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import { APIService } from '../../../../core'
import { NotificationsService } from '../../../../shared-ui'
import {
  FILL_ALL_FORM_FIELDS,
  INVALID_EMAIL_ADDRESS,
  INVALID_UFL_EMAIL,
  LOGIN_FAILED,
  setAuthToken,
  validateEmail,
  validateUFLDomain,
} from '../../../../utils'

import type { LoginData } from '../../models/login.model'

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  public isLoading$ = this.isLoadingSubject.asObservable()

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  handleUserLogin = (loginData: LoginData): void => {
    const inputsValidation = this.validateLoginData(loginData)
    if (!inputsValidation.isValid) {
      this.notificationsService.addNotification({
        message: inputsValidation.message,
        type: 'error',
      })
      this.isLoadingSubject.next(false)
      return
    }

    const returnUrl: string = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/'

    this.isLoadingSubject.next(true)
    this.apiService
      .post('login', { email: loginData.email, password: loginData.password })
      .subscribe({
        next: (response: unknown) => {
          const tokenResponse = response as { token: string }
          if (tokenResponse?.token) {
            setAuthToken(tokenResponse.token)
            this.router.navigate([returnUrl], { replaceUrl: true })
            this.isLoadingSubject.next(true)
          } else {
            this.notificationsService.addNotification({
              message: LOGIN_FAILED,
              type: 'error',
            })
          }
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

  handleOnSignup = (): void => {
    this.router.navigate(['/auth/signup'])
  }

  private validateLoginData = (loginData: LoginData): { isValid: boolean; message: string } => {
    const email = loginData?.email?.trim()
    const password = loginData?.password

    if (!email || !password) {
      return { isValid: false, message: FILL_ALL_FORM_FIELDS }
    } else if (validateEmail(email) === false) {
      return { isValid: false, message: INVALID_EMAIL_ADDRESS }
    } else if (validateUFLDomain(email) === false) {
      return { isValid: false, message: INVALID_UFL_EMAIL }
    }

    return { isValid: true, message: '' }
  }
}
