import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text',
  standalone: true,
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
})
export class TextComponent {
  @Input() textContent: string = "";
  @Input() fontSize: string = "16px";
  @Input() textColor: string = "black";
}
