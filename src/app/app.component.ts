import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FieldComponent } from './components/field/field.component';
import { PawnComponent } from './components/pawn/pawn.component';
import { WebRequestsService } from './services/web-requests.service';

import _positions from '../assets/positions.json';
import { gameState } from './models/interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FieldComponent,
    PawnComponent,
    NgFor,
    HttpClientModule,
  ],
  providers: [WebRequestsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chineese-game';
  passedValue = 'passed text';
  positions: any;

  constructor(private _webRequestsService: WebRequestsService) {}

  ngOnInit() {
    this.positions = _positions;
    console.log(this.positions);
  }

  handleDice() {
    this._webRequestsService
      .getBoardState()
      .subscribe((data) => this.handleGameState(data));
  }

  handleGameState(gameState: gameState[]) {
    for (let field of this.positions) {
      field.pawn = null;
    }

    for (let pawn of gameState[Math.floor(Math.random() * 2)].pawns) {
      this.positions[pawn.pos].pawn = pawn.color;
    }
    console.log(this.positions);
  }
}
