import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'

import { FormComponent } from '../form/form.component'
import { LoginData } from '../../models/login.model'
import { LoginService } from '../../services/login.service'

import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent, FormComponent],
})
export class LoginComponent {
  loginData: LoginData = { email: '', password: '' }

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  onSubmit = (): void => {
    this.loginService.handleUserLogin(this.loginData.email, this.loginData.password)
  }

  onSignUp = (): void => {
    this.router.navigate(['/auth/signup'])
  }
}
