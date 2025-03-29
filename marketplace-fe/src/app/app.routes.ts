import { Routes } from '@angular/router'
import { ProductComponent } from './features/product/product.component';


import { authenticationGuard, noAuthenticationGuard } from './core'

import { LandingPageComponent } from './features/landing-page/landing-page.component'
import { LoginComponent, SignupComponent } from './features/auth/pages'
import { MyAccountComponent } from './features/my-account/my-account.component'
import { ProductsComponent } from './features/products/products.component'

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent, canActivate: [noAuthenticationGuard] },
  { path: 'auth/signup', component: SignupComponent, canActivate: [noAuthenticationGuard] },
  { path: '', component: LandingPageComponent, canActivate: [authenticationGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authenticationGuard] },
  { path: 'my-account', component: MyAccountComponent, canActivate: [authenticationGuard] },
  { path: 'product', component: ProductComponent, canActivate: [authenticationGuard] }
];

