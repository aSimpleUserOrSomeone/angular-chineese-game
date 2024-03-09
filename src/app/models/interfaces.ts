export interface gameState {
  sessionId: string;
  turn: string;
  action: 'dice' | 'move' | 'wait';
  diceValue?: number;
  pawns: Array<pawn>;
  red?: string;
  yellow?: string;
  green?: string;
  blue?: string;
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
  userToken?: string;
  userName: string;
}

export interface handshakeReturn {
  status: number;
  message?: string;
  userToken?: string;
}
