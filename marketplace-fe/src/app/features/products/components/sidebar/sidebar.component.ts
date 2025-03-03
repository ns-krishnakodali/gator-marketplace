import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
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
  categoriesSelected: string[] = []

  @Output() selectedCategories = new EventEmitter<string[]>()
  @Output() selectedSortOption = new EventEmitter<string>()

  get categoryValues() {
    return Object.values(Categories)
  }

  get sortOptionValues() {
    return Object.values(SortOptions)
  }

  onCategoryChange = (category: string, checked: boolean): void => {
    if (checked) {
      this.categoriesSelected.push(category)
    } else {
      const index: number = this.categoriesSelected.indexOf(category)
      if (index !== -1) {
        this.categoriesSelected.splice(index, 1)
      }
    }

    this.selectedCategories.emit(this.categoriesSelected)
  }

  onSortOptionChange = (sortOption: string): void => {
    const sortKeySelected: string =
      Object.keys(SortOptions).find(
        (key: string) => SortOptions[key as keyof typeof SortOptions] === sortOption
      ) || ''

    this.selectedSortOption.emit(sortKeySelected)
  }
}
