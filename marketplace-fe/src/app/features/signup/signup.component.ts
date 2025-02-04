import { Component } from '@angular/core'

import { ButtonComponent, InputComponent, TextComponent } from '../../shared-ui/'

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [ButtonComponent, InputComponent, TextComponent],
})
export class SignupComponent {
  username: string = ''
  password: string = ''

  onSubmit() {
    console.log('Form Submitted')
    console.log('Username:', this.username)
    console.log('Password:', this.password)
  }
}
