import { Routes } from '@angular/router'

import { authenticationGuard, noAuthenticationGuard } from './core'

import { LoginComponent, SignupComponent } from './features/auth/pages'
import { LandingPageComponent } from './features/landing-page/landing-page.component'
import { MyAccountComponent } from './features/my-account/my-account.component'
import { ProductComponent } from './features/product/product.component'
import { ProductsComponent } from './features/products/products.component'

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent, canActivate: [noAuthenticationGuard] },
  { path: 'auth/signup', component: SignupComponent, canActivate: [noAuthenticationGuard] },
  { path: '', component: LandingPageComponent, canActivate: [authenticationGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authenticationGuard] },
  { path: 'list-product', component: ProductsComponent, canActivate: [authenticationGuard] },
  { path: 'my-account', component: MyAccountComponent, canActivate: [authenticationGuard] },
  { path: 'product/:productId', component: ProductComponent, canActivate: [authenticationGuard] },
]
