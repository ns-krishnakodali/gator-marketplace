import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import { InputComponent } from '../../../../shared-ui'
import { ProfileService } from '../../services/profile.service'

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIconModule, CommonModule, InputComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  @Input() displayPictureSrc?: string
  @Input() name!: string
  @Input() displayName!: string
  @Input() email!: string
  @Input() mobileNumber!: string

  @Input() oldPassword!: string
  @Input() newPassword!: string

  isUploadingImage$: Observable<boolean>

  constructor(private profileService: ProfileService) {
    this.isUploadingImage$ = this.profileService.isUploadingImage$
  }

  async onImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      try {
        this.displayPictureSrc = await this.profileService.uploadDisplayPicture(input.files[0])
      } catch (error) {
        console.error('Error reading image file:', error)
      }
    }
  }
}
