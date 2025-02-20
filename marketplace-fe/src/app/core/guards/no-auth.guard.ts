/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router'
import { isValidToken } from '../../utils'

export const noAuthenticationGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const router: Router = inject(Router)

  if (isValidToken()) {
    router.navigate(['/'])
    return false
  } else {
    return true
  }
}
