import { Component, EventEmitter, Input, Output } from '@angular/core'

import { type InputType } from './input.model'
import { formatMobileNumber } from '../../utils'

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
  @Input() pattern?: string

  @Output() valueChange = new EventEmitter<string>()
  @Output() checkedChange = new EventEmitter<boolean>()

  onChange = (event: Event): void => {
    let newValue: string

    if (this.disabled) {
      return
    }

    if (this.type === 'checkbox' || this.type === 'radio') {
      const newCheckedValue: boolean = (event.target as HTMLInputElement).checked
      this.checked = newCheckedValue
      this.checkedChange.emit(newCheckedValue)
      return
    } else if (this.type === 'tel') {
      newValue = formatMobileNumber((event.target as HTMLInputElement).value)
    } else {
      newValue = (event.target as HTMLInputElement).value
    }

    this.value = newValue
    this.valueChange.emit(newValue)
  }
}
