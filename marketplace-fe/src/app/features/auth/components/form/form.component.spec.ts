import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { FormComponent } from './form.component'
import { TextComponent } from '../../../../shared-ui/'

describe('FormComponent', () => {
  let component: FormComponent
  let fixture: ComponentFixture<FormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent, TextComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(FormComponent)
    component = fixture.componentInstance
  })

  it('should create the form component', () => {
    expect(component).toBeTruthy()
  })

  it('should bind the id correctly', () => {
    component.id = 'test-form'
    fixture.detectChanges()
    const formElement = fixture.debugElement.query(By.css('div')).nativeElement
    expect(formElement.id).toBe('test-form')
  })

  it('should bind the heading correctly', () => {
    component.heading = 'Form Heading'
    fixture.detectChanges()
    const headingElement = fixture.debugElement.query(By.css('app-text')).nativeElement
    expect(headingElement.textContent.trim()).toBe('Form Heading')
  })

  it('should emit the submitForm event when the form is submitted', () => {
    spyOn(component.submitForm, 'emit')
    component.id = 'test-form'
    component.heading = 'Form Heading'
    fixture.detectChanges()
    const formElement = fixture.debugElement.query(By.css('form')).nativeElement
    formElement.dispatchEvent(new Event('submit'))
    expect(component.submitForm.emit).toHaveBeenCalledWith(jasmine.any(Event))
  })

  it('should prevent default form submission behavior', () => {
    spyOn(component, 'onSubmit')
    const formElement = fixture.debugElement.query(By.css('form')).nativeElement
    formElement.dispatchEvent(new Event('submit'))
    expect(component.onSubmit).toHaveBeenCalled()
  })
})
