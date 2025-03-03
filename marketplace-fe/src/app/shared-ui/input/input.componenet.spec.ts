import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DebugElement } from '@angular/core'
import { By } from '@angular/platform-browser'

import { InputComponent } from './input.component'

describe('InputComponent', () => {
  let component: InputComponent
  let fixture: ComponentFixture<InputComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(InputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should bind id property', () => {
    component.id = 'input-id'
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.id).toBe('input-id')
  })

  it('should bind class property', () => {
    component.class = 'custom-class'
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.classList.contains('custom-class')).toBeTrue()
  })

  it('should bind value property', () => {
    component.value = 'Test Value'
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.value).toBe('Test Value')
  })

  it('should bind checked property for checkbox type', () => {
    component.type = 'checkbox'
    component.checked = true
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.checked).toBeTrue()
  })

  it('should bind disabled property', () => {
    component.disabled = true
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.disabled).toBeTrue()
  })

  it('should emit valueChange event on input value change', () => {
    spyOn(component.valueChange, 'emit')
    component.value = 'Test'
    fixture.detectChanges()

    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    inputElement.nativeElement.value = 'New Value'
    inputElement.triggerEventHandler('change', { target: { value: 'New Value' } })
    expect(component.valueChange.emit).toHaveBeenCalledWith('New Value')
  })

  it('should emit checkedChange event on checkbox change', () => {
    spyOn(component.checkedChange, 'emit')
    component.type = 'checkbox'
    component.checked = false
    fixture.detectChanges()

    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    inputElement.nativeElement.checked = true
    inputElement.triggerEventHandler('change', { target: { checked: true } })
    expect(component.checkedChange.emit).toHaveBeenCalledWith(true)
  })

  it('should handle radio button input correctly', () => {
    spyOn(component.checkedChange, 'emit')
    component.type = 'radio'
    fixture.detectChanges()

    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    inputElement.nativeElement.checked = true
    inputElement.triggerEventHandler('change', { target: { checked: true } })
    expect(component.checkedChange.emit).toHaveBeenCalledWith(true)
  })

  it('should handle text input correctly', () => {
    spyOn(component.valueChange, 'emit')
    component.type = 'text'
    fixture.detectChanges()

    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    inputElement.nativeElement.value = 'Some text'
    inputElement.triggerEventHandler('change', { target: { value: 'Some text' } })
    expect(component.valueChange.emit).toHaveBeenCalledWith('Some text')
  })

  it('should not emit events when input is disabled', () => {
    spyOn(component.valueChange, 'emit')
    spyOn(component.checkedChange, 'emit')
    component.disabled = true
    fixture.detectChanges()

    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    inputElement.nativeElement.value = 'New Value'
    inputElement.triggerEventHandler('change', { target: { value: 'New Value' } })
    expect(component.valueChange.emit).not.toHaveBeenCalled()
    expect(component.checkedChange.emit).not.toHaveBeenCalled()
  })

  it('should bind placeholder property', () => {
    component.placeholder = 'Enter value'
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.placeholder).toBe('Enter value')
  })

  it('should bind required property', () => {
    component.required = true
    fixture.detectChanges()
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    expect(inputElement.nativeElement.required).toBeTrue()
  })

  it('should emit valueChange with the correct value when the input is changed', () => {
    spyOn(component.valueChange, 'emit')
    component.value = 'Initial Value'
    fixture.detectChanges()

    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'))
    inputElement.nativeElement.value = 'Updated Value'
    inputElement.triggerEventHandler('change', { target: { value: 'Updated Value' } })
    expect(component.valueChange.emit).toHaveBeenCalledWith('Updated Value')
  })
})
