import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  gameState,
  handshakeCall,
  handshakeReturn,
} from '../models/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebRequestsService {
  private _url: string = '/api/gamestate.php';
  private handshakeUrl: string = '/api/handshake.php';
  private joinGameUrl: string = '/api/joingame.php';
  private setReadyUrl: string = '/api/setready.php';
  private lastSetReadyTimestamp: number = 0;

  constructor(private http: HttpClient) {}

  getBoardState(
    gameState: gameState,
    userName: string,
    userToken: string
  ): Observable<{ gameState?: gameState; status: number; message?: string }> {
    const body: object = { gameState, userName, userToken };

    return this.http.post<{
      gameState: gameState;
      status: number;
      message?: string;
    }>(this._url, body);
  }

  callServerHandshake(userName: string, userToken?: string) {
    const body: handshakeCall = { userName, userToken };
    if (userToken) body['userToken'] = userToken;
    let res = this.http.post<handshakeReturn>(this.handshakeUrl, body);
    return res;
  }

  joinGame(userName: string, userToken: string, gameId: number) {
    const body = { userName, userToken, gameId };
    let res = this.http.post<{ status: number; message: string }>(
      this.joinGameUrl,
      body
    );
    return res;
  }

  setReady(
    isReady: boolean,
    userName: string,
    userToken: string
  ): Observable<{ status: number; message: string }> | null {
    const timestamp = new Date().getTime();
    if (timestamp - this.lastSetReadyTimestamp < 500) return null;
    this.lastSetReadyTimestamp = timestamp;

    const body = { isReady, userName, userToken };
    let res = this.http.post<{ status: number; message: string }>(
      this.setReadyUrl,
      body
    );
    return res;
  }
}
