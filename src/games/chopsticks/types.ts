export type Fingers = 0 | 1 | 2 | 3 | 4;
export type HandSide = 'left' | 'right';

export interface PlayerState {
  left: Fingers;
  right: Fingers;
}

export interface GameState {
  p1: PlayerState;
  p2: PlayerState;
  turn: 'p1' | 'p2';
  status: 'waiting' | 'playing' | 'finished';
  winner: 'p1' | 'p2' | null;
}

export interface Room {
  gameState: GameState;
  p1Id: string;
  p2Id: string | null;
  createdAt: number;
}

export type ActionType = 'hit' | 'transfer';

export interface HitAction {
  type: 'hit';
  attackerHand: HandSide;
  targetHand: HandSide;
}

export interface TransferAction {
  type: 'transfer';
  newLeft: Fingers;
  newRight: Fingers;
}

export type Action = HitAction | TransferAction;
