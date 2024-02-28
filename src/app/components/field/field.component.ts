import { NgStyle, NgIf } from '@angular/common';
import {
  Component,
  Input,
  Output,
  SimpleChanges,
  EventEmitter,
  input,
} from '@angular/core';
// import {
//   trigger,
//   state,
//   style,
//   animate,
//   transition,
// } from '@angular/animations';
import { fieldData } from '../../models/interfaces';

interface fieldStyle {
  left: any;
  top: any;
  'box-shadow'?: any;
  'outline-color'?: any;
  cursor?: any;
}

interface pawnStyle {
  'background-color'?: string;
}

@Component({
  selector: 'app-field',
  standalone: true,
  imports: [NgStyle, NgIf],
  animations: [],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss',
})
export class FieldComponent {
  @Input() data!: fieldData;
  @Input() fieldIndex!: number;
  @Input() gameAction?: string;
  @Input() whoseAction?: string;
  @Input() playerColor?: string;
  @Output() onValidHover = new EventEmitter<number>();

  hasHover: boolean = false;
  hasPawn: boolean = false;
  fieldStyle?: fieldStyle;
  pawnStyle: pawnStyle = {};

  constructor() {}

  ngOnInit() {
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateStyle();
      if (this.data.pawnColor) this.hasPawn = true;
    }
  }

  updateStyle() {
    this.fieldStyle = {
      left: this.data.leftPercent,
      top: this.data.topPercent,
    };

    if (this.data.color)
      this.fieldStyle['box-shadow'] = `inset 0 0 1em -1px ${this.data.color}`;

    if (this.data.isDestination) {
      this.fieldStyle['outline-color'] = 'var(--contrast)';
    } else if (this.isHoverValid()) {
      if (this.hasHover && this.data.pawnColor) {
        this.fieldStyle['outline-color'] = 'var(--white)';
        this.fieldStyle['cursor'] = 'pointer';
      } else if (this.data.pawnColor) {
        this.fieldStyle['outline-color'] = 'var(--primary2)';
      }
    }

    if (this.data.pawnColor) {
      this.pawnStyle['background-color'] = this.data.pawnColor;
    }
  }

  isHoverValid() {
    if (
      this.gameAction === 'move' &&
      this.whoseAction === this.playerColor &&
      this.playerColor === this.data.pawnColor
    )
      return true;
    return false;
  }

  enterHover() {
    this.hasHover = true;
    this.updateStyle();
    if (this.hasPawn) {
      this.onValidHover.emit(this.fieldIndex);
    }
  }

  leaveHover() {
    this.hasHover = false;
    this.updateStyle();
    if (this.hasPawn) {
      this.onValidHover.emit(-1);
    }
  }
}
