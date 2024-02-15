export interface gameState {
  sessionId: string;
  turn: string;
  action: string;
  pawns: Array<pawn>;
}

interface pawn {
  pos: number;
  color: string;
}

export interface fieldData {
  color?: string;
  leftPercent: string;
  topPercent: string;
  pawn?: string;
}
