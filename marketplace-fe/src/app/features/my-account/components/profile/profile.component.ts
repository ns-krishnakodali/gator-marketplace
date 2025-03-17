import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'

import { AccountDetails } from '../../models/'
import { ProfileService } from '../../services/'
import { InputComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIconModule, CommonModule, InputComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  accountDetails!: AccountDetails

  currentPassword!: string
  newPassword!: string

  areLoadingAccountDetails$: Observable<boolean>
  areUpdatingAccountDetails$: Observable<boolean>
  isUpdatingUserPassword$: Observable<boolean>
  isUploadingImage$: Observable<boolean>

  constructor(private profileService: ProfileService) {
    this.areLoadingAccountDetails$ = this.profileService.areLoadingAccountDetails$
    this.areUpdatingAccountDetails$ = this.profileService.areUpdatingAccountDetails$
    this.isUpdatingUserPassword$ = this.profileService.isUpdatingUserPassword$
    this.isUploadingImage$ = this.profileService.isUploadingImage$
  }

  ngOnInit(): void {
    this.profileService.userDetails$.subscribe((data: AccountDetails) => {
      this.accountDetails = data
    })
    this.profileService.getAccountDetails()
  }

  async onImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      try {
        this.accountDetails.displayPictureSrc = await this.profileService.updateDisplayPicture(
          input.files[0]
        )
      } catch (error) {
        console.error('Error reading image file:', error)
      }
    }
  }

  getDisplayPictureStatus = (): boolean =>
    this.profileService.getDisplayPictureStatus(this.accountDetails?.displayPictureSrc)

  updateAccountDetails = (): void => {
    this.profileService.updateAccountDetails(this.accountDetails)
  }

  updateAccountPassword = (): void => {
    this.profileService.updateAccountPassword(this.currentPassword, this.newPassword)
  }
}
