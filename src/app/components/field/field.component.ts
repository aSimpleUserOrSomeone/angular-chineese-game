import { NgStyle, NgIf } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { fieldData } from '../../models/interfaces';

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
  imports: [NgStyle, NgIf],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss',
})
export class FieldComponent {
  @Input() data!: fieldData;
  @Input() hasHover: boolean = false;
  hasPawn: boolean = false;
  myStyle?: fieldStyle;

  constructor() {}

  ngOnInit() {
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes');

    if (changes['data']) {
      this.updateStyle();
    }
  }

  updateStyle() {
    this.myStyle = {
      left: this.data.leftPercent,
      top: this.data.topPercent,
    };

    if (this.data.color)
      this.myStyle['box-shadow'] = `inset 0 0 1em -1px ${this.data.color}`;
    if (this.hasHover && this.data.pawn) {
      this.myStyle['outline-color'] = 'var(--white)';
      this.myStyle['cursor'] = 'pointer';
    }
    if (this.data.pawn) {
      this.myStyle['outline-color'] = 'var(--primary2)';
    }
  }
}
