import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { ButtonComponent } from './button.component'

describe('ButtonComponent', () => {
  let component: ButtonComponent
  let fixture: ComponentFixture<ButtonComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ButtonComponent)
    component = fixture.componentInstance
  })

  it('should create the button component', () => {
    expect(component).toBeTruthy()
  })

  it('should apply the correct variant class', () => {
    component.variant = 'secondary'
    fixture.detectChanges()
    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement
    expect(buttonElement.classList).toContain('secondary')
  })

  it('should disable the button when disabled is true', () => {
    component.disabled = true
    fixture.detectChanges()
    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement
    expect(buttonElement.disabled).toBeTrue()
  })

  it('should call the onClickHandler when clicked', () => {
    component.onClickHandler = jasmine.createSpy('onClickHandler')
    fixture.detectChanges()
    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement
    buttonElement.click()
    expect(component.onClickHandler).toHaveBeenCalled()
  })
})
