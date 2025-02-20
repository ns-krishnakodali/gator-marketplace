import { Routes } from '@angular/router'
import { LoginComponent, SignupComponent } from './features/auth'
import { LandingPageComponent } from './features/landing-page/components/page/landing-page.component'

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: '', component: LandingPageComponent },
]
