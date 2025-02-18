import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'

import { APIService } from '../../../../core'
import { LoginService } from './login.service'
import { NotificationsService } from '../../../../shared-ui'
import {
  LOGIN_FAILED,
  FILL_ALL_FORM_FIELDS,
  INVALID_EMAIL_ADDRESS,
  INVALID_UFL_EMAIL,
} from '../../../../utils'

describe('LoginService', () => {
  let service: LoginService
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>
  let apiServiceSpy: jasmine.SpyObj<APIService>
  let routerSpy: jasmine.SpyObj<Router>

  beforeEach(() => {
    const notificationsSpy = jasmine.createSpyObj('NotificationsService', ['addNotification'])
    const apiSpy = jasmine.createSpyObj('APIService', ['post'])
    const routerMock = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        { provide: APIService, useValue: apiSpy },
        { provide: NotificationsService, useValue: notificationsSpy },
        { provide: Router, useValue: routerMock },
      ],
    })

    service = TestBed.inject(LoginService)
    notificationsServiceSpy = TestBed.inject(
      NotificationsService
    ) as jasmine.SpyObj<NotificationsService>
    apiServiceSpy = TestBed.inject(APIService) as jasmine.SpyObj<APIService>
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should show an error if login fields are empty', () => {
    service.handleUserLogin({ email: '', password: '' })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: FILL_ALL_FORM_FIELDS,
      type: 'error',
    })
  })

  it('should show an error if email is invalid', () => {
    service.handleUserLogin({ email: 'invalid-email', password: 'password123' })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: INVALID_EMAIL_ADDRESS,
      type: 'error',
    })
  })

  it('should show an error if email is not from UFL domain', () => {
    service.handleUserLogin({ email: 'user@example.com', password: 'password123' })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: INVALID_UFL_EMAIL,
      type: 'error',
    })
  })

  it('should call API and navigate on successful login', () => {
    apiServiceSpy.post.and.returnValue(of({ token: 'valid_token' }))
    service.handleUserLogin({ email: 'user@ufl.edu', password: 'password123' })
    expect(apiServiceSpy.post).toHaveBeenCalledWith('login', {
      email: 'user@ufl.edu',
      password: 'password123',
    })
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true })
  })

  it('should show error notification if login fails', () => {
    apiServiceSpy.post.and.returnValue(of({}))
    service.handleUserLogin({ email: 'user@ufl.edu', password: 'password123' })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: LOGIN_FAILED,
      type: 'error',
    })
  })

  it('should handle API error response correctly', () => {
    apiServiceSpy.post.and.returnValue(throwError(() => new Error('Login error')))
    service.handleUserLogin({ email: 'user@ufl.edu', password: 'password123' })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: 'Login error',
      type: 'error',
    })
  })

  it('should set isLoading to false on API failure', (done) => {
    apiServiceSpy.post.and.returnValue(throwError(() => new Error('Login error')))
    service.handleUserLogin({ email: 'user@ufl.edu', password: 'password123' })
    service.isLoading$.subscribe((isLoading) => {
      expect(isLoading).toBeFalse()
      done()
    })
  })

  it('should navigate to signup page', () => {
    service.handleOnSignup()
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/signup'])
  })
})
