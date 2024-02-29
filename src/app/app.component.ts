import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FieldComponent } from './components/field/field.component';
import { WebRequestsService } from './services/web-requests.service';

import _positions from '../assets/positions.json';
import {
  gameState,
  fieldData,
  fieldHoverEmiterData,
} from './models/interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FieldComponent,
    NgFor,
    HttpClientModule,
    // BrowserModule,
    // BrowserAnimationsModule,
  ],
  providers: [WebRequestsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chineese-game';
  passedValue = 'passed text';
  positions: fieldData[] = _positions;
  lastIndexHovered: number = -1;
  gameState?: gameState;

  constructor(private _webRequestsService: WebRequestsService) {}

  ngOnInit() {}

  handleDice() {
    this._webRequestsService
      .getBoardState()
      .subscribe((data) => this.handleGameState(data));
  }

  handleGameState(gameState: gameState[]) {
    this.positions = this.positions.map((pos) => ({
      ...pos,
      pawnColor: undefined,
    }));

    let ran = Math.floor(Math.random() * 2);
    this.gameState = gameState[ran];
    for (let pawn of gameState[ran].pawns) {
      this.positions[pawn.pos].pawnColor = pawn.color;
    }
    // console.log(this.positions.map((pos) => pos.pawnColor));
  }

  handleFieldValidHover(fieldHoverEmiterData: fieldHoverEmiterData) {
    if (fieldHoverEmiterData.id === this.lastIndexHovered) return;
    this.lastIndexHovered = fieldHoverEmiterData.id;

    if (fieldHoverEmiterData.id === -1) {
      this.positions = this.positions.map((pos) => ({
        ...pos,
        isDestination: false,
      }));
      return;
    }

    if (
      this.gameState?.action === 'dice' ||
      !this.gameState?.diceValue ||
      !fieldHoverEmiterData.isHoverValid
    )
      return;

    //math regarding the correct highlight
    let targetDestination = fieldHoverEmiterData.id + this.gameState.diceValue;

    //check regular playingspot
    if (fieldHoverEmiterData.id < 56) {
      switch (fieldHoverEmiterData.pawnColor) {
        case 'red':
          if (fieldHoverEmiterData.id < 40 && targetDestination > 40)
            targetDestination += 0;
          if (targetDestination > 43) targetDestination = -1;
          break;
        case 'yellow':
          if (fieldHoverEmiterData.id < 10 && targetDestination > 10)
            targetDestination += 34;
          if (targetDestination > 47) targetDestination = -1;

          break;
        case 'blue':
          if (fieldHoverEmiterData.id < 20 && targetDestination > 20)
            targetDestination += 28;
          if (targetDestination > 51) targetDestination = -1;

          break;
        case 'green':
          if (fieldHoverEmiterData.id < 30 && targetDestination > 30)
            targetDestination += 22;
          if (targetDestination > 55) targetDestination = -1;

          break;
      }
    }

    this.positions = this.positions.map((pos, i) => {
      if (i === targetDestination) return { ...pos, isDestination: true };
      return { ...pos };
    });
  }
}
