import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import { ButtonComponent, InputComponent, TextComponent } from '../../shared-ui/'

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent],
})
export class SignupComponent {
  username?: string
  password?: string

  onSubmit = (): void => {
    console.log(this.username, this.password)
  }
}
