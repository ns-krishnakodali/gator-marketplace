import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'
import { FormComponent } from '../form/form.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent, FormComponent],
})
export class LoginComponent {
  email?: string
  password?: string

  onSubmit = (): void => {
    if (this.email === 'user@example.com' && this.password === 'password123') {
      alert('Login successful!')
    }
  }
}
