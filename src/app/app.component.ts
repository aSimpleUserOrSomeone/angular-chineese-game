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
} from './models/interfaces';

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

  constructor(private _webRequestsService: WebRequestsService) {}

  ngOnInit() {
    this.startGame();
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
      localStorage.removeItem('userToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('gameId');
      this.userToken = undefined;
      this.userName = undefined;
      this.gameId = undefined;
      this.gameState = undefined;

      alert('Wyrzucono Cię z gry!');
    }

    this.positions = this.positions.map((pos) => ({
      ...pos,
      pawnColor: undefined,
    }));
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
    let targetDestination = fieldHoverEmiterData.id + this.gameState.diceValue;

    //check regular playingspot
    if (fieldHoverEmiterData.id < 56) {
      switch (fieldHoverEmiterData.pawnColor) {
        case 'red':
          // if (fieldHoverEmiterData.id < 40 && targetDestination >= 40)
          //   targetDestination += 0;
          if (targetDestination > 43) targetDestination = -1;
          break;
        case 'yellow':
          if (fieldHoverEmiterData.id < 10 && targetDestination >= 10)
            targetDestination += 34;
          if (targetDestination > 47) targetDestination = -1;
          break;
        case 'blue':
          if (fieldHoverEmiterData.id < 20 && targetDestination >= 20)
            targetDestination += 28;
          if (targetDestination > 51) targetDestination = -1;

          break;
        case 'green':
          if (fieldHoverEmiterData.id < 30 && targetDestination >= 30)
            targetDestination += 22;
          if (targetDestination > 55) targetDestination = -1;
          break;
      }
    } else if (fieldHoverEmiterData.id < 72) {
      //check starting spots
      if (this.gameState.diceValue !== 1 && this.gameState.diceValue !== 6)
        targetDestination = -1;
      else {
        switch (fieldHoverEmiterData.pawnColor) {
          case 'red':
            if (fieldHoverEmiterData.id >= 56) targetDestination = 0;
            break;
          case 'yellow':
            if (fieldHoverEmiterData.id >= 60) targetDestination = 10;
            break;
          case 'blue':
            if (fieldHoverEmiterData.id >= 64) targetDestination = 20;
            break;
          case 'green':
            if (fieldHoverEmiterData.id >= 68) targetDestination = 30;
            break;
          default:
            break;
        }
      }
    }

    this.positions = this.positions.map((pos, i) => {
      if (i === targetDestination) return { ...pos, isDestination: true };
      return { ...pos };
    });
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
}
