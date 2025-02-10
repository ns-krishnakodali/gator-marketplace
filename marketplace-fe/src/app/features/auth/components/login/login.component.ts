import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'

import { FormComponent } from '../form/form.component'
import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent, FormComponent],
})
export class LoginComponent {
  email?: string
  password?: string

  constructor(private router: Router) {}

  onSubmit(event: Event) {
    console.log('Form submitted: ', event)
  }

  onSignUp = (): void => {
    this.router.navigate(['/auth/signup'])
  }
}
