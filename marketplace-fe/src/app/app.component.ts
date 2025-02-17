import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NotificationsComponent } from './shared-ui/'

@Component({
  selector: 'app-root',
  imports: [RouterModule, NotificationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
