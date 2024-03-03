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
  private _url: string = '/assets/dummyGame.json';
  private handshakeUrl: string = '/assets/dummyHandshake.json';

  constructor(private http: HttpClient) {}

  getBoardState(): Observable<gameState[]> {
    return this.http.get<gameState[]>(this._url);
  }

  callServerHandshake(nick: string, token?: string) {
    const body: handshakeCall = { nick };
    if (token) body['token'] = token;
    let req = this.http.post<handshakeReturn>(this.handshakeUrl, body);
    return req;
  }
}
