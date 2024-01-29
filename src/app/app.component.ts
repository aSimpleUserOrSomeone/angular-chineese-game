import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FieldComponent } from './field/field.component';
import _positions from '../assets/positions.json';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FieldComponent, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chineese-game';
  passedValue = 'passed text';
  positions: any;

  constructor() {
    this.positions = _positions;
  }

  ngOnInit() {
    console.log(this.positions);
  }
}
