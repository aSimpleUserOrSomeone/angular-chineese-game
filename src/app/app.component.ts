import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FieldComponent } from './components/field/field.component';
import { PawnComponent } from './components/pawn/pawn.component';
import { WebRequestsService } from './services/web-requests.service';

import _positions from '../assets/positions.json';
import { gameState, fieldData } from './models/interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FieldComponent,
    PawnComponent,
    NgFor,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  providers: [WebRequestsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chineese-game';
  passedValue = 'passed text';
  positions: fieldData[] = _positions;

  constructor(private _webRequestsService: WebRequestsService) {}

  ngOnInit() {}

  handleDice() {
    this._webRequestsService
      .getBoardState()
      .subscribe((data) => this.handleGameState(data));
  }

  handleGameState(gameState: gameState[]) {
    this.positions = this.positions.map((field) => ({
      ...field,
      pawn: undefined,
    }));

    let ran = Math.floor(Math.random() * 2);
    for (let pawn of gameState[ran].pawns) {
      this.positions[pawn.pos].pawn = pawn.color;
    }
  }
}
