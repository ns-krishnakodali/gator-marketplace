import { Component } from '@angular/core'

import { HeadingComponent, TextComponent } from '../../../../shared-ui'
import { SAFETY_TIPS } from '../../../../utils'

@Component({
  selector: 'app-safety-tips',
  imports: [HeadingComponent, TextComponent],
  templateUrl: './safety-tips.component.html',
  styleUrl: './safety-tips.component.css',
})
export class SafetyTipsComponent {
  readonly safetyTips = SAFETY_TIPS
}
