import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'

import { SignupComponent } from './signup.component'

import { SignupData } from '../../models/signup.model'
import { SignupService } from '../../services'

describe('SignupComponent', () => {
  let component: SignupComponent
  let fixture: ComponentFixture<SignupComponent>
  let signupServiceSpy: jasmine.SpyObj<SignupService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SignupService', ['handleUserSignup', 'handleOnLogin'], {
      isLoading$: of(false),
    })

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [{ provide: SignupService, useValue: spy }],
    }).compileComponents()

    fixture = TestBed.createComponent(SignupComponent)
    component = fixture.componentInstance
    signupServiceSpy = TestBed.inject(SignupService) as jasmine.SpyObj<SignupService>
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call handleUserSignup on onSubmit', () => {
    const signupData: SignupData = {
      name: 'Test User',
      email: 'test@ufl.edu',
      mobileNumber: '123-456-7890',
      password: 'pass',
      confirmPassword: 'pass',
    }
    component.signupData = signupData
    component.onSubmit()
    expect(signupServiceSpy.handleUserSignup).toHaveBeenCalledWith(signupData)
  })

  it('should call handleOnLogin on onLogin', () => {
    component.onLogin()
    expect(signupServiceSpy.handleOnLogin).toHaveBeenCalled()
  })
})
