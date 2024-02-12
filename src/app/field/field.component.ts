import { NgStyle } from '@angular/common';
import { Component, Input, numberAttribute } from '@angular/core';

interface fieldData {
  color: string;
  leftPercent: string;
  topPercent: string;
}

interface fieldStyle {
  left: any;
  top: any;
  'box-shadow'?: any;
  'outline-color'?: any;
  cursor?: any;
}

@Component({
  selector: 'app-field',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss',
})
export class FieldComponent {
  @Input() data!: fieldData;
  hasInteraction: boolean = true;
  @Input() hasHover: boolean = false;

  constructor() {}

  getStyle() {
    let newStyle: fieldStyle = {
      left: this.data.leftPercent,
      top: this.data.topPercent,
    };
    if (this.data.color)
      newStyle['box-shadow'] = `inset 0 0 1em -1px ${this.data.color}`;
    if (this.hasHover && this.hasInteraction) {
      newStyle['outline-color'] = 'var(--white)';
    } else if (this.hasInteraction) {
      newStyle['outline-color'] = 'var(--primary2)';
      newStyle['cursor'] = 'pointer';
    }

    return newStyle;
  }
}
