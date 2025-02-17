import { Injectable } from '@angular/core'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { validateEmail, validateUFLDomain } from '../../../utils'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private notificationsService: NotificationsService,
    private apiService: APIService,
    private router: Router
  ) {}

  handleUserLogin = (email: string, password: string): void => {
    const inputsValidation = this.validateInputs(email, password)
    if (!inputsValidation.isValid) {
      this.notificationsService.addNotification({
        message: inputsValidation.message,
        type: 'error',
      })
      return
    }
    this.router.navigate(['/'])
  }

  private validateInputs = (
    email: string,
    password: string
  ): { isValid: boolean; message: string } => {
    const email_ = email?.trim()
    const password_ = password?.trim()

    if (!email_ || !password_) {
      return { isValid: false, message: 'Please fill in all fields.' }
    } else if (validateEmail(email_) === false) {
      return { isValid: false, message: 'Invalid email address.' }
    } else if (validateUFLDomain(email_) === false) {
      return { isValid: false, message: 'Please provide a valid UFL email (ufl.edu)' }
    }

    return { isValid: true, message: '' }
  }
}
