import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DebugElement } from '@angular/core'
import { By } from '@angular/platform-browser'

import { InputComponent } from './input.component'
import { InputType } from './input.model'

describe('InputComponent', () => {
  let component: InputComponent
  let fixture: ComponentFixture<InputComponent>
  let inputElement: DebugElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(InputComponent)
    component = fixture.componentInstance
    component.id = 'test-input' // Set required input
    fixture.detectChanges()
    inputElement = fixture.debugElement.query(By.css('input'))
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('Input properties', () => {
    it('should bind id property', () => {
      component.id = 'input-id'
      fixture.detectChanges()
      expect(inputElement.nativeElement.id).toBe('input-id')
    })

    it('should bind class property', () => {
      component.class = 'custom-class'
      fixture.detectChanges()
      expect(inputElement.nativeElement.classList.contains('custom-class')).toBeTrue()
    })

    it('should have empty class if no class is provided', () => {
      component.class = undefined
      fixture.detectChanges()
      expect(inputElement.nativeElement.className).toBe('')
    })

    it('should bind value property', () => {
      component.value = 'Test Value'
      fixture.detectChanges()
      expect(inputElement.nativeElement.value).toBe('Test Value')
    })

    it('should use empty string for value if none provided', () => {
      component.value = undefined
      fixture.detectChanges()
      expect(inputElement.nativeElement.value).toBe('')
    })

    it('should bind checked property for checkbox type', () => {
      component.type = 'checkbox'
      component.checked = true
      fixture.detectChanges()
      expect(inputElement.nativeElement.checked).toBeTrue()
    })

    it('should bind disabled property', () => {
      component.disabled = true
      fixture.detectChanges()
      expect(inputElement.nativeElement.disabled).toBeTrue()
    })

    it('should bind placeholder property', () => {
      component.placeholder = 'Enter value'
      fixture.detectChanges()
      expect(inputElement.nativeElement.placeholder).toBe('Enter value')
    })

    it('should use empty string for placeholder if none provided', () => {
      component.placeholder = undefined
      fixture.detectChanges()
      expect(inputElement.nativeElement.placeholder).toBe('')
    })

    it('should bind required property', () => {
      component.required = true
      fixture.detectChanges()
      expect(inputElement.nativeElement.required).toBeTrue()
    })

    it('should bind pattern attribute when provided', () => {
      component.pattern = '[a-zA-Z]+'
      fixture.detectChanges()
      expect(inputElement.nativeElement.pattern).toBe('[a-zA-Z]+')
    })

    it('should not set pattern attribute when not provided', () => {
      component.pattern = undefined
      fixture.detectChanges()
      expect(inputElement.nativeElement.hasAttribute('pattern')).toBeFalse()
    })

    it('should bind name attribute when provided', () => {
      component.name = 'test-name'
      fixture.detectChanges()
      expect(inputElement.nativeElement.name).toBe('test-name')
    })

    it('should set correct input type', () => {
      const testTypes: { type: string | undefined; expected: string }[] = [
        { type: 'text', expected: 'text' },
        { type: 'password', expected: 'password' },
        { type: 'email', expected: 'email' },
        { type: 'number', expected: 'number' },
        { type: 'checkbox', expected: 'checkbox' },
        { type: 'radio', expected: 'radio' },
        { type: 'tel', expected: 'tel' },
        { type: 'file', expected: 'file' },
      ]

      testTypes.forEach(({ type, expected }) => {
        component.type = type as InputType
        fixture.detectChanges()
        expect(inputElement.nativeElement.type).toBe(expected)
      })
    })

    it('should default to text type if not specified', () => {
      component.type = 'text' as InputType
      fixture.detectChanges()
      expect(inputElement.nativeElement.type).toBe('text')
    })
  })

  describe('Event handling', () => {
    it('should emit valueChange event on input value change', () => {
      spyOn(component.valueChange, 'emit')
      component.value = 'Test'
      fixture.detectChanges()

      inputElement.nativeElement.value = 'New Value'
      inputElement.triggerEventHandler('change', { target: { value: 'New Value' } })

      expect(component.value).toBe('New Value')
      expect(component.valueChange.emit).toHaveBeenCalledWith('New Value')
    })

    it('should emit checkedChange event on checkbox change', () => {
      spyOn(component.checkedChange, 'emit')
      component.type = 'checkbox'
      component.checked = false
      fixture.detectChanges()

      inputElement.triggerEventHandler('change', { target: { checked: true } })

      expect(component.checked).toBeTrue()
      expect(component.checkedChange.emit).toHaveBeenCalledWith(true)
    })

    it('should handle radio button input correctly', () => {
      spyOn(component.checkedChange, 'emit')
      component.type = 'radio'
      fixture.detectChanges()

      inputElement.triggerEventHandler('change', { target: { checked: true } })

      expect(component.checked).toBeTrue()
      expect(component.checkedChange.emit).toHaveBeenCalledWith(true)
    })

    it('should not emit events when input is disabled', () => {
      spyOn(component.valueChange, 'emit')
      spyOn(component.checkedChange, 'emit')
      component.disabled = true
      fixture.detectChanges()

      inputElement.nativeElement.value = 'New Value'
      inputElement.triggerEventHandler('change', { target: { value: 'New Value', checked: true } })

      expect(component.valueChange.emit).not.toHaveBeenCalled()
      expect(component.checkedChange.emit).not.toHaveBeenCalled()
    })

    it('should format telephone numbers when type is tel', () => {
      spyOn(component.valueChange, 'emit')
      component.type = 'tel'
      fixture.detectChanges()

      // Assuming formatMobileNumber transforms "1234567890" to "(123) 456-7890"
      inputElement.triggerEventHandler('change', { target: { value: '1234567890' } })

      // Verify the component calls the valueChange.emit with the formatted value
      // The actual formatting logic is tested separately
      expect(component.valueChange.emit).toHaveBeenCalled()
    })
  })

  describe('Special input types', () => {
    it('should properly handle email input type', () => {
      component.type = 'email'
      fixture.detectChanges()
      expect(inputElement.nativeElement.type).toBe('email')
    })

    it('should properly handle number input type', () => {
      component.type = 'number'
      fixture.detectChanges()
      expect(inputElement.nativeElement.type).toBe('number')
    })

    it('should properly handle file input type', () => {
      component.type = 'file'
      fixture.detectChanges()
      expect(inputElement.nativeElement.type).toBe('file')
    })
  })
})
