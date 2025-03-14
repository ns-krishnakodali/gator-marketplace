import { Component, Input } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'
import { MatDivider } from '@angular/material/divider'

import { InputComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatDivider, InputComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  @Input() name!: string
  @Input() displayName!: string
  @Input() email!: string
  @Input() mobileNumber!: string

  @Input() oldPassword!: string
  @Input() newPassword!: string
}
