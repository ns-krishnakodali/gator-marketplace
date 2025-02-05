import { Component } from '@angular/core';
import { InputComponent } from "../../shared-ui/input/input.component";
import { ButtonComponent } from "../../shared-ui/button/button.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [InputComponent, ButtonComponent]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  login() {
    if (this.email === 'user@example.com' && this.password === 'password123') {
      alert('Login successful!');
    }
  }
}


