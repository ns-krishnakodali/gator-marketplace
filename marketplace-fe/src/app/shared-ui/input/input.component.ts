import { Component, EventEmitter, Input, Output } from '@angular/core'

import { type InputType } from './input.model'

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent {
  @Input({ required: true }) id!: string
  @Input() class?: string
  @Input() checked?: boolean
  @Input() disabled?: boolean
  @Input() name?: string
  @Input() placeholder?: string
  @Input() required?: boolean
  @Input() readOnly?: boolean
  @Input() type: InputType = 'text'
  @Input() value?: string

  @Output() valueChange = new EventEmitter<string>()
  @Output() checkedChange = new EventEmitter<boolean>()

  onChange = (event: Event): void => {
    if (this.disabled) {
      return
    }
    if (this.type === 'checkbox' || this.type === 'radio') {
      const newValue: boolean = (event.target as HTMLInputElement).checked
      this.checked = newValue
      this.checkedChange.emit(newValue)
      return
    }
    const newValue: string = (event.target as HTMLInputElement).value
    this.value = newValue
    this.valueChange.emit(newValue)
  }
}
