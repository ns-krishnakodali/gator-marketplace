import { Routes } from '@angular/router'

import { authenticationGuard, noAuthenticationGuard } from './core'

import { LoginComponent, SignupComponent } from './features/auth/pages'
import { CartComponent } from './features/cart/cart.component'
import { CheckoutComponent } from './features/checkout/checkout.component'
import { LandingPageComponent } from './features/landing-page/landing-page.component'
import { ListProductComponent } from './features/list-product/list-product.component'
import { MyAccountComponent } from './features/my-account/my-account.component'
import { ProductComponent } from './features/product/product.component'
import { ProductsComponent } from './features/products/products.component'
import { OrderComponent } from './features/order/order.component'

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent, canActivate: [noAuthenticationGuard] },
  { path: 'auth/signup', component: SignupComponent, canActivate: [noAuthenticationGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authenticationGuard] },
  {
    path: 'checkout/:checkoutFrom',
    component: CheckoutComponent,
    canActivate: [authenticationGuard],
  },
  { path: 'list-product', component: ListProductComponent, canActivate: [authenticationGuard] },
  { path: 'my-account', component: MyAccountComponent, canActivate: [authenticationGuard] },
  { path: 'order/:orderId', component: OrderComponent, canActivate: [authenticationGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authenticationGuard] },
  { path: 'product/:productId', component: ProductComponent, canActivate: [authenticationGuard] },
  { path: '', component: LandingPageComponent, canActivate: [authenticationGuard] },
]
