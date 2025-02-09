import { Routes } from '@angular/router'
import { LoginComponent, SignupComponent } from './features/auth'

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
]
