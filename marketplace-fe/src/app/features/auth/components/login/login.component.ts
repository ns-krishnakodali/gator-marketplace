import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Observable } from 'rxjs'

import { FormComponent } from '../form/form.component'
import { LoginData } from '../../models/login.model'
import { LoginService } from '../../services/'

import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
export class LoginComponent {
  loginData: LoginData = { email: '', password: '' }
  isLoading$: Observable<boolean>

  constructor(private loginService: LoginService) {
    this.isLoading$ = this.loginService.isLoading$
  }

  onSubmit = (): void => {
    this.loginService.handleUserLogin(this.loginData)
  }

  onSignUp = (): void => {
    this.loginService.handleOnSignup()
  }
}
