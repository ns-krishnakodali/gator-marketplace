import { Component, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'

import { TextComponent } from '../../../../shared-ui/'

@Component({
  selector: 'app-landing-page-card',
  imports: [MatCardModule, TextComponent],
  templateUrl: './landing-page-card.component.html',
  styleUrls: ['./landing-page-card.component.css'],
})
export class LandingPageCardComponent {
  @Input({ required: true }) iconSrc = ''
  @Input({ required: true }) iconAlt = ''
  @Input({ required: true }) cardTitle = ''
  @Input({ required: true }) cardDescription = ''
  @Input({ required: true }) onCardClick!: () => void
}
