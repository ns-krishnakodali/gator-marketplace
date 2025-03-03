import { Routes } from '@angular/router'

import { authenticationGuard, noAuthenticationGuard } from './core'

import { LoginComponent, SignupComponent } from './features/auth/pages'
import { LandingPageComponent } from './features/landing-page/landing-page.component'
import { ProductsComponent } from './features/products/products.component'

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent, canActivate: [noAuthenticationGuard] },
  { path: 'auth/signup', component: SignupComponent, canActivate: [noAuthenticationGuard] },
  { path: '', component: LandingPageComponent, canActivate: [authenticationGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authenticationGuard] },
]
