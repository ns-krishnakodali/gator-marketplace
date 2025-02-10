import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'

import { FormComponent } from '../form/form.component'

import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent, FormComponent],
})
export class SignupComponent {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string

  constructor(private router: Router) {}

  onSubmit = (event: Event): void => {
    console.log('Form Submitted: ', event)
  }

  onLogin = (): void => {
    this.router.navigate(['/auth/login'])
  }
}
