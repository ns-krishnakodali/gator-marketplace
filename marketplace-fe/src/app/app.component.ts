import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationsComponent } from './shared-ui/';
import { SidebarComponent } from './features/products/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, NotificationsComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], 
})
export class AppComponent {
  menuItems = [
    { label: 'Home', onClick: () => { console.log('Home clicked'); }, route: '/home' }, 
    { label: 'Profile', onClick: () => { console.log('Profile clicked'); }, route: '/profile' }  
  ];
  isExpanded = true;  
}
