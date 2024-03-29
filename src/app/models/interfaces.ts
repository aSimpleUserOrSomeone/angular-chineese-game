export interface gameState {
  sessionId: string;
  turn: 'red' | 'yellow' | 'blue' | 'green';
  action: 'dice' | 'move' | 'wait' | 'win';
  diceValue?: number;
  pawns: Array<pawn>;
  red?: playerGameState;
  yellow?: playerGameState;
  green?: playerGameState;
  blue?: playerGameState;
  actionTimestamp?: number;
}

interface playerGameState {
  userName: string;
  isReady?: boolean;
}

export interface pawn {
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
