import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'

import { LoginComponent } from './login.component'
import { LoginService } from '../../services/'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let loginServiceSpy: jasmine.SpyObj<LoginService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('LoginService', ['handleUserLogin', 'handleOnSignup'], {
      isLoading$: of(false),
    })

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: LoginService, useValue: spy }],
    }).compileComponents()

    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
    loginServiceSpy = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call handleUserLogin on submit', () => {
    component.loginData = { email: 'test@example.com', password: 'password' }
    component.onSubmit()
    expect(loginServiceSpy.handleUserLogin).toHaveBeenCalledWith(component.loginData)
  })

  it('should call handleOnSignup on onSignUp', () => {
    component.onSignUp()
    expect(loginServiceSpy.handleOnSignup).toHaveBeenCalled()
  })
})
