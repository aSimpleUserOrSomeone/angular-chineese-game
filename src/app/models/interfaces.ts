export interface gameState {
  sessionId: string;
  turn: string;
  action: 'dice' | 'move';
  diceValue?: number;
  pawns: Array<pawn>;
}

interface pawn {
  pos: number;
  color: string;
}

export interface fieldData {
  leftPercent: string;
  topPercent: string;
  color?: string;
  pawnColor?: string;
  isDestination?: boolean;
}

export interface fieldHoverEmiterData {
  id: number;
  isHoverValid?: boolean;
  pawnColor?: string;
}

export interface handshakeCall {
  token?: string;
  nick: string;
}

export interface handshakeReturn {
  token?: string;
  message: string;
}
