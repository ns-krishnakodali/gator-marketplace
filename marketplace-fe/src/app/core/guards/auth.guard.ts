import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router'
import { isValidToken } from '../../utils'

export const authenticationGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const router: Router = inject(Router)

  if (isValidToken()) {
    return true
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: _state.url } })
    return false
  }
}
