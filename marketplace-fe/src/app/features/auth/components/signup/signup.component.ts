import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import { FormComponent } from '../form/form.component'

import { ButtonComponent, InputComponent, TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [MatButtonModule, ButtonComponent, InputComponent, TextComponent, FormComponent],
})
export class SignupComponent {
  username?: string
  password?: string

  onSubmit = (): void => {
    console.log(this.username, this.password)
  }
}
