import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import { ButtonComponent, InputComponent, TextComponent } from '../../shared-ui'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent],
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
