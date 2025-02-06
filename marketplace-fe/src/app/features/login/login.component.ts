import { Component } from '@angular/core'

import { ButtonComponent, InputComponent } from '../../shared-ui'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [InputComponent, ButtonComponent],
})
export class LoginComponent {
  email?: string
  password?: string

  onClick = (): void => {
    if (this.email === 'user@example.com' && this.password === 'password123') {
      alert('Login successful!')
    }
  }
}
