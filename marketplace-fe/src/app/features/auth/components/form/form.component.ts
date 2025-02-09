import { Component, Input } from '@angular/core'
import { TextComponent } from '../../../../shared-ui/'

@Component({
  selector: 'app-form',
  imports: [TextComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  @Input({ required: true }) id!: string
  @Input({ required: true }) heading!: string
  @Input({ required: true }) onSubmit!: () => void
}
