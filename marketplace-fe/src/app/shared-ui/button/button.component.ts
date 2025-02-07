import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

import { type ButtonType, type ButtonVariant } from './button.model'

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input({ required: true }) id!: string
  @Input({ required: true }) onClickHandler!: () => void
  @Input() type: ButtonType = 'button'
  @Input() variant: ButtonVariant = 'primary'
  @Input() class?: string
  @Input() disabled?: boolean
}
