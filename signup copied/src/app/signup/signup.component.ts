

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

import { ButtonComponent } from "../shared-ui/button/button.component";  

@Component({
  selector: 'app-signup',
  standalone: true,  
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [FormsModule, ButtonComponent]  
})
export class SignupComponent {
  username: string = '';
  password: string = '';

  onSubmit() {
    console.log('Form Submitted');
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
