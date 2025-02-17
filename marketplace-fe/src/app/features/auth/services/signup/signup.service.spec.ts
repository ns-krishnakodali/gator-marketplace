import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'

import { APIService } from '../../../../core'
import { NotificationsService } from '../../../../shared-ui'
import { SignupService } from './signup.service'
import {
  FILL_ALL_FORM_FIELDS,
  INVALID_EMAIL_ADDRESS,
  INVALID_UFL_EMAIL,
  PASSWORDS_DO_NOT_MATCH,
} from '../../../../utils'

describe('SignupService', () => {
  let service: SignupService
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>
  let apiServiceSpy: jasmine.SpyObj<APIService>
  let routerSpy: jasmine.SpyObj<Router>

  beforeEach(() => {
    const notificationsSpy = jasmine.createSpyObj('NotificationsService', ['addNotification'])
    const apiSpy = jasmine.createSpyObj('APIService', ['post'])
    const routerMock = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      providers: [
        SignupService,
        { provide: NotificationsService, useValue: notificationsSpy },
        { provide: APIService, useValue: apiSpy },
        { provide: Router, useValue: routerMock },
      ],
    })

    service = TestBed.inject(SignupService)
    notificationsServiceSpy = TestBed.inject(
      NotificationsService
    ) as jasmine.SpyObj<NotificationsService>
    apiServiceSpy = TestBed.inject(APIService) as jasmine.SpyObj<APIService>
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should show an error if signup fields are empty', () => {
    service.handleUserSignup({ name: '', email: '', password: '', confirmPassword: '' })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: FILL_ALL_FORM_FIELDS,
      type: 'error',
    })
  })

  it('should show an error if email is invalid', () => {
    service.handleUserSignup({
      name: 'User',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: INVALID_EMAIL_ADDRESS,
      type: 'error',
    })
  })

  it('should show an error if email is not from UFL domain', () => {
    service.handleUserSignup({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: INVALID_UFL_EMAIL,
      type: 'error',
    })
  })

  it('should show an error if passwords do not match', () => {
    service.handleUserSignup({
      name: 'User',
      email: 'user@ufl.edu',
      password: 'password123',
      confirmPassword: 'password321',
    })
    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: PASSWORDS_DO_NOT_MATCH,
      type: 'error',
    })
  })

  it('should call API and navigate on successful signup', () => {
    apiServiceSpy.post.and.returnValue(of({}))
    service.handleUserSignup({
      name: 'User',
      email: 'user@ufl.edu',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(apiServiceSpy.post).toHaveBeenCalledWith('signup', {
      name: 'User',
      email: 'user@ufl.edu',
      password: 'password123',
    })
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'])
  })

  it('should handle API error response correctly', () => {
    apiServiceSpy.post.and.returnValue(throwError(() => new Error('Signup error')))
    service.handleUserSignup({
      name: 'User',
      email: 'user@ufl.edu',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(notificationsServiceSpy.addNotification).toHaveBeenCalledWith({
      message: 'Signup error',
      type: 'error',
    })
  })

  it('should set isLoading to false on API failure', (done) => {
    apiServiceSpy.post.and.returnValue(throwError(() => new Error('Signup error')))
    service.handleUserSignup({
      name: 'User',
      email: 'user@ufl.edu',
      password: 'password123',
      confirmPassword: 'password123',
    })
    service.isLoading$.subscribe((isLoading) => {
      expect(isLoading).toBeFalse()
      done()
    })
  })

  it('should navigate to login page', () => {
    service.handleOnLogin()
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'])
  })
})
