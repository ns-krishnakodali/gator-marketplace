import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

import { type TextSize } from './text.model'

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css',
})
export class TextComponent {
  @Input() size: TextSize = 'medium'
  @Input() className?: string
}
