import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FieldComponent } from './components/field/field.component';
import { WebRequestsService } from './services/web-requests.service';

import _positions from '../assets/positions.json';
import { gameState, fieldData } from './models/interfaces';

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

  handleFieldValidHover(fieldIndex: number) {
    if (fieldIndex === this.lastIndexHovered) return;
    this.lastIndexHovered = fieldIndex;

    
    if (fieldIndex === -1) {
      this.positions = this.positions.map((pos) => ({
        ...pos,
        isDestination: false,
      }));
      return;
    }
    console.log(this.gameState);

    if (this.gameState?.action !== 'move' || !this.gameState.diceValue) return;
    console.log("handled2");

    let correctDestination = fieldIndex + this.gameState.diceValue;
    if (correctDestination >= 40) correctDestination -= 40;

    this.positions = this.positions.map((pos, i) => {
      if (i === correctDestination) return { ...pos, isDestination: true };
      return { ...pos };
    });
  }
}
