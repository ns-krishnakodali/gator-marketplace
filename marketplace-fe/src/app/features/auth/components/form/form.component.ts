import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { TextComponent } from '../../../../shared-ui/'

@Component({
  selector: 'app-form',
  imports: [TextComponent, FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  @Input({ required: true }) id!: string
  @Input({ required: true }) heading!: string

  @Output() submitForm = new EventEmitter<Event>()

  onSubmit(event: Event) {
    event.preventDefault()
    this.submitForm.emit(event)
  }
}
