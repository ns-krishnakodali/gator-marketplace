import { Component, Input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import { type ButtonType, type ButtonVariant } from './button.model'

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input({ required: true }) id!: string
  @Input({ required: true }) onClickHandler!: () => void
  @Input() buttonType: ButtonType = 'button'
  @Input() buttonVariant: ButtonVariant = 'primary'
  @Input() className?: string
  @Input() disabled?: boolean
}
