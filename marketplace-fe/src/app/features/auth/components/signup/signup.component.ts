import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Observable } from 'rxjs'

import { FormComponent } from '../form/form.component'
import { SignupData } from '../../models/signup.model'
import { SignupService } from '../../services/'

import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [
    ButtonComponent,
    CommonModule,
    InputComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    TextComponent,
    FormComponent,
  ],
})
export class SignupComponent {
  signupData: SignupData = { name: '', email: '', password: '', confirmPassword: '' }
  isLoading$: Observable<boolean>

  constructor(private signupService: SignupService) {
    this.isLoading$ = this.signupService.isLoading$
  }

  onSubmit = (): void => {
    this.signupService.handleUserSignup(this.signupData)
  }

  onLogin = (): void => {
    this.signupService.handleOnLogin()
  }
}
