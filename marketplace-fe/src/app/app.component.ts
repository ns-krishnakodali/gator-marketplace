import { Component } from '@angular/core'
import { SignupComponent } from "./features/signup/signup.component";
import { LoginComponent } from "./features/login/login.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [SignupComponent, LoginComponent],
})
export class AppComponent {
  title = 'marketplace-fe'
}
