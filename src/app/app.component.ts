import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { FieldComponent } from './components/field/field.component';
import { WebRequestsService } from './services/web-requests.service';

import _positions from '../assets/positions.json';
import {
  gameState,
  fieldData,
  fieldHoverEmiterData,
  pawn,
} from './models/interfaces';
import { reduce } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FieldComponent,
    NgFor,
    NgIf,
    NgStyle,
    HttpClientModule,
    // BrowserModule,
    // BrowserAnimationsModule,
  ],
  providers: [WebRequestsService, CookieService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chineese-game';
  positions: fieldData[] = _positions;
  lastIndexHovered: number = -1;
  userName?: string;
  userToken?: string;
  gameId?: number;
  playerColor?: string;
  playerReadyState: boolean = false;
  gameState?: gameState;
  isHandshaked: boolean = false;
  infoText?: string;
  canUseDice: boolean = false;
  isGameMuted: boolean = true;
  diceStyle: any = {};
  speechSynthesis?: SpeechSynthesis;
  voices?: SpeechSynthesisVoice[];
  previousAction?: string;
  isPL: boolean = true;

  constructor(private _webRequestsService: WebRequestsService) {}

  ngOnInit() {
    this.startGame();

    if ('speechSynthesis' in window) {
      console.log('speechSynthesis in window');

      this.speechSynthesis = window.speechSynthesis;
      console.log(this.speechSynthesis.speaking);

      this.voices = this.speechSynthesis.getVoices();
    }
  }

  speak() {
    let voiceNumber = 0;

    const message = `${this.gameState?.diceValue}`;
    let utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = this.voices![voiceNumber];
    utterance.pitch = 1.5;
    utterance.rate = 1.25;
    utterance.volume = 0.8;
    if (this.isPL) {
      utterance.lang = 'pl-PL';
    } else {
      utterance.lang = 'de-DE';
    }
    this.speechSynthesis!.speak(utterance);
  }

  pollGameState() {
    this._webRequestsService
      .getBoardState(this.gameState!, this.userName!, this.userToken!)
      .subscribe((res) => {
        if (res.status >= 200 && res.status < 300) {
          this.handleGameState(res.gameState!);
          this.pollGameState();
        } else if (res.status >= 400 && res.status < 500) {
          console.log(`API response: status - ${res.status}, ${res.message}`);
          this.restart();
        }
      });
  }

  handleDice() {
    if (!this.canUseDice || !this.isHandshaked) return;
    const $response = this._webRequestsService.sendAction(
      this.userName!,
      this.userToken!,
      'dice'
    );

    if ($response == null) return console.warn('You are clicking too fast!');

    $response.subscribe({
      next: (res) => {
        console.log(`API response: Status ${res.status} - ${res.message}`);
      },
    });
  }

  btnReadyClick(event: MouseEvent) {
    const $response = this._webRequestsService.setReady(
      !this.playerReadyState,
      this.userName!,
      this.userToken!
    );
    if ($response == null) return console.warn('You are clicking too fast!');

    $response.subscribe({
      next: (res) => {
        console.log(`API response: Status ${res.status} - ${res.message}`);
      },
    });
  }

  handleGameState(gameState: gameState) {
    //check if still in game
    if (
      !(
        gameState.red?.userName == this.userName ||
        gameState.yellow?.userName == this.userName ||
        gameState.blue?.userName == this.userName ||
        gameState.green?.userName == this.userName
      )
    ) {
      this.restart();
    }

    this.positions = this.positions.map((pos) => ({
      ...pos,
      pawnColor: undefined,
    }));
    this.previousAction = this.gameState?.action;

    this.gameState = gameState;
    console.log(gameState);

    for (let pawn of gameState.pawns) {
      this.positions[pawn.pos].pawnColor = pawn.color;
    }

    if (gameState.red?.userName == this.userName) {
      this.playerColor = 'red';
    } else if (gameState.yellow?.userName == this.userName) {
      this.playerColor = 'yellow';
    } else if (gameState.green?.userName == this.userName) {
      this.playerColor = 'green';
    } else if (gameState.blue?.userName == this.userName) {
      this.playerColor = 'blue';
    } else {
      console.error("Couldn't assign player color!");
    }

    if (this.gameState.action == 'wait') {
      this.infoText = 'Czekanie na start';
    } else if (gameState.action == 'dice') {
      this.infoText = 'Rzuca kostką ';
    } else if (gameState.action == 'move') {
      this.infoText = 'Rusza pionkiem ';
      if (this.previousAction != this.gameState.action && !this.isGameMuted) {
        this.speak();
      }
    } else if (gameState.action == 'win') {
      this.gameEnd();
    }
    if (gameState.action == 'dice' || gameState.action == 'move') {
      this.infoText += gameState[gameState.turn]?.userName!;
    }

    switch (this.playerColor) {
      case 'red':
        this.playerReadyState = this.gameState?.red?.isReady || false;
        break;
      case 'yellow':
        this.playerReadyState = this.gameState?.yellow?.isReady || false;
        break;
      case 'blue':
        this.playerReadyState = this.gameState?.blue?.isReady || false;
        break;
      case 'green':
        this.playerReadyState = this.gameState?.green?.isReady || false;
        break;
    }

    this.canUseDice = false;
    if (gameState.action == 'wait' || gameState.action == 'dice') {
      this.diceStyle['background-image'] = `url('../assets/spinner.gif')`;
      if (gameState.action == 'dice' && this.playerColor == gameState.turn) {
        this.canUseDice = true;
      }
    } else if (gameState.action == 'move') {
      this.diceStyle[
        'background-image'
      ] = `url('../assets/dice${gameState.diceValue}.png')`;
    }
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
    let target = fieldHoverEmiterData.id + this.gameState.diceValue;
    let position = fieldHoverEmiterData.id;
    let hasMoved = false;
    if (position < 56) {
      switch (fieldHoverEmiterData.pawnColor) {
        case 'red':
          if (position < 40 && target >= 40) {
            hasMoved = true;
            target += 0;
            target = this.calculateExceedEnd(
              43,
              position,
              target,
              this.gameState.pawns
            );
          } else if (position >= 40) {
            hasMoved = true;
            target = this.calculateExceedEnd(
              43,
              position,
              target,
              this.gameState.pawns
            );
          }

          break;

        case 'yellow':
          if (position < 10 && target >= 10) {
            hasMoved = true;
            target += 34;
            target = this.calculateExceedEnd(
              47,
              position,
              target,
              this.gameState.pawns
            );
          } else if (position >= 44) {
            hasMoved = true;
            target = this.calculateExceedEnd(
              47,
              position,
              target,
              this.gameState.pawns
            );
            console.log(target);
          }

          break;

        case 'blue':
          if (position < 20 && target >= 20) {
            hasMoved = true;
            target += 28;
            target = this.calculateExceedEnd(
              51,
              position,
              target,
              this.gameState.pawns
            );
          } else if (position >= 48) {
            hasMoved = true;
            target = this.calculateExceedEnd(
              51,
              position,
              target,
              this.gameState.pawns
            );
          }

          break;

        case 'green':
          if (position < 30 && target >= 30) {
            hasMoved = true;
            target += 22;
            target = this.calculateExceedEnd(
              55,
              position,
              target,
              this.gameState.pawns
            );
          } else if (position >= 52) {
            hasMoved = true;
            target = this.calculateExceedEnd(
              55,
              position,
              target,
              this.gameState.pawns
            );
          }

          break;
      }
    }
    if (position < 40 && !hasMoved) {
      if (target >= 40) target -= 40;
    } else if (position < 72 && !hasMoved) {
      switch (fieldHoverEmiterData.pawnColor) {
        case 'red':
          target = 0;
          break;
        case 'yellow':
          target = 10;
          break;
        case 'blue':
          target = 20;
          break;
        case 'green':
          target = 0;
          break;
      }
    }

    this.positions = this.positions.map((pos, i) => {
      if (i === target) return { ...pos, isDestination: true };
      return { ...pos };
    });
  }

  calculateExceedEnd(
    endFieldEnd: number,
    pos: number,
    target: number,
    pawns: Array<pawn>
  ) {
    if (target > endFieldEnd) target = endFieldEnd;

    while (target > pos) {
      if (this.getPosPawn(target, pawns) == null) break;
      target -= 1;
    }

    if (target < endFieldEnd - 3) target = pos;
    return target;
  }

  getPosPawn(pos: number, pawns: Array<pawn>) {
    for (let pawn of pawns) {
      if (pawn.pos == pos) return pawn;
    }
    return null;
  }

  handleFieldValidClick(id: number) {
    if (!this.isHandshaked) return;
    const $response = this._webRequestsService.sendAction(
      this.userName!,
      this.userToken!,
      'move',
      id
    );
    if ($response == null) return console.warn('You are clicking too fast');

    $response.subscribe({
      next: (res) => {
        console.log(`API response: Status ${res.status} - ${res.message}`);
      },
    });
  }

  startGame() {
    //check if name is stored
    if (typeof localStorage.getItem('userName') === 'string')
      this.userName = localStorage.getItem('userName')!;
    if (typeof localStorage.getItem('userToken') === 'string')
      this.userToken = localStorage.getItem('userToken')!;

    while (!this.userName) {
      this.userName = prompt('Podaj nick') || undefined;
    }

    const $handshake = this._webRequestsService.callServerHandshake(
      this.userName,
      this.userToken
    );

    $handshake.subscribe({
      next: (handshake) => {
        console.log(handshake);
        if (handshake.status >= 400 && handshake.status < 500) {
          if (handshake.message) console.log(`API error: ${handshake.message}`);
          //unsuccessfull handshake -> retry
          this.userName = undefined;
          localStorage.setItem('userName', '');
          return this.startGame();
        } else if (handshake.status >= 200 && handshake.status < 300) {
          if (handshake.message)
            console.log(`API response: ${handshake.message}`);
          this.isHandshaked = true;
          this.userToken = handshake.userToken;
          localStorage.setItem('userToken', this.userToken!);
          localStorage.setItem('userName', this.userName!);

          this.joinGame(this.userName!, this.userToken!);
        }
      },
    });
  }

  joinGame(userName: string, userToken: string) {
    if (typeof localStorage.getItem('gameId') === 'string')
      this.gameId = parseInt(localStorage.getItem('gameId')!);

    while (!this.gameId) {
      let p: any = prompt('Podaj id gry (max 4 cyfry)') || undefined;
      this.gameId = /^[0-9]*$/.test(p) ? parseInt(p) : undefined;
    }

    const $startGame = this._webRequestsService.joinGame(
      userName,
      userToken,
      this.gameId
    );
    $startGame.subscribe({
      next: (response) => {
        if (response.status == 400) {
          console.warn(`API response: ${response.message}`);
          this.joinGame(userName, userToken);
        } else if (response.status == 401) {
          console.warn(`API response: ${response.message}`);
          this.startGame();
        } else if (response.status == 200) {
          console.log(`API response: ${response.message}`);
          localStorage.setItem('gameId', this.gameId!.toString());
          this.pollGameState();
        }
      },
    });
  }

  gameEnd() {
    alert('Koniec gry!');
    localStorage.removeItem('gameId');
    this.gameId = undefined;
    this.gameState = undefined;
    this.startGame();
  }

  restart() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('gameId');
    this.userToken = undefined;
    this.userName = undefined;
    this.gameId = undefined;
    this.gameState = undefined;

    alert('Wyrzucono Cię z gry!');
    window.location.reload();
  }
}
