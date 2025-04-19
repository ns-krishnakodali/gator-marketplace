import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-heading',
  imports: [],
  templateUrl: './heading.component.html',
  styleUrl: './heading.component.css',
})
export class HeadingComponent {
  @Input({ required: true }) id!: string
  @Input({ required: true }) heading!: string
}
