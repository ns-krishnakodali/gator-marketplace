import { Component, Input } from '@angular/core'

import { type InputType } from './input.model'

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent {
  @Input({ required: true }) id!: string
  @Input() name?: string
  @Input() class?: string
  @Input() type: InputType = 'text'
  @Input() value?: string
  @Input() placeholder?: string
  @Input() required?: boolean
  @Input() readOnly?: boolean
}
