import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import { APIService } from '../../../../core'
import { NotificationsService } from '../../../../shared-ui'

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  public isLoading$ = this.isLoadingSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  callProtectedEndpoint = (): void => {
    this.isLoadingSubject.next(true)
    this.apiService.get('api/protected').subscribe({
      next: () => {
        this.isLoadingSubject.next(false)
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.isLoadingSubject.next(false)
      },
      complete: () => {
        this.isLoadingSubject.next(false)
      },
    })
  }

  navigateTo = (path: string): void => {
    this.router.navigate([path])
  }
}
