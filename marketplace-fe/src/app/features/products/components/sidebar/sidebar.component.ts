import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatDivider } from '@angular/material/divider'

import { Categories, SortOptions } from '../../models'
import { InputComponent } from '../../../../shared-ui/'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatDivider, CommonModule, InputComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() categories: string[] = this.categoryValues
  @Input() sortOptions: string[] = this.sortOptionValues

  get categoryValues() {
    return Object.values(Categories)
  }

  get sortOptionValues() {
    return Object.values(SortOptions)
  }
}
