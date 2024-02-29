import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { gameState } from '../models/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebRequestsService {
  private _url: string = '/assets/dummyGame.json';

  constructor(private http: HttpClient) {}

  getBoardState(): Observable<gameState[]> {
    return this.http.get<gameState[]>(this._url);
  }

  callServerHandshake() {}
}
