import type { Action, Fingers, GameState, HandSide, PlayerState } from './types';

export const INITIAL_GAME_STATE: GameState = {
  p1: { left: 1, right: 1 },
  p2: { left: 1, right: 1 },
  turn: 'p1',
  status: 'playing',
  winner: null,
};

function clamp(n: number): Fingers {
  return (((n % 5) + 5) % 5) as Fingers;
}

function isAlive(p: PlayerState): boolean {
  return p.left > 0 || p.right > 0;
}

function setHand(p: PlayerState, hand: HandSide, value: Fingers): PlayerState {
  return hand === 'left' ? { ...p, left: value } : { ...p, right: value };
}

function getHand(p: PlayerState, hand: HandSide): Fingers {
  return hand === 'left' ? p.left : p.right;
}

export function isValidHit(state: GameState, attackerHand: HandSide, targetHand: HandSide): boolean {
  const attacker = state.turn === 'p1' ? state.p1 : state.p2;
  const target = state.turn === 'p1' ? state.p2 : state.p1;
  return getHand(attacker, attackerHand) > 0 && getHand(target, targetHand) > 0;
}

export function isValidTransfer(state: GameState, newLeft: number, newRight: number): boolean {
  const current = state.turn === 'p1' ? state.p1 : state.p2;
  const total = current.left + current.right;

  if (newLeft < 0 || newRight < 0 || newLeft > 4 || newRight > 4) return false;
  if (newLeft + newRight !== total) return false;
  // state must change
  if (newLeft === current.left && newRight === current.right) return false;

  return true;
}

export function applyHit(state: GameState, attackerHand: HandSide, targetHand: HandSide): GameState {
  const isP1Turn = state.turn === 'p1';
  const attacker = isP1Turn ? state.p1 : state.p2;
  const target = isP1Turn ? state.p2 : state.p1;

  const attackVal = getHand(attacker, attackerHand);
  const targetVal = getHand(target, targetHand);
  const newTargetVal = clamp(targetVal + attackVal);

  const newTarget = setHand(target, targetHand, newTargetVal);
  const newTurn = isP1Turn ? 'p2' : 'p1';

  const winner = !isAlive(newTarget) ? (isP1Turn ? 'p1' : 'p2') : null;

  return {
    ...state,
    p1: isP1Turn ? attacker : newTarget,
    p2: isP1Turn ? newTarget : attacker,
    turn: newTurn,
    status: winner ? 'finished' : 'playing',
    winner,
  };
}

export function applyTransfer(state: GameState, newLeft: Fingers, newRight: Fingers): GameState {
  const isP1Turn = state.turn === 'p1';
  const newPlayerState: PlayerState = { left: newLeft, right: newRight };

  return {
    ...state,
    p1: isP1Turn ? newPlayerState : state.p1,
    p2: isP1Turn ? state.p2 : newPlayerState,
    turn: isP1Turn ? 'p2' : 'p1',
  };
}

export function applyAction(state: GameState, action: Action): GameState {
  if (action.type === 'hit') {
    return applyHit(state, action.attackerHand, action.targetHand);
  }
  return applyTransfer(state, action.newLeft, action.newRight);
}

export function getValidTransfers(state: GameState): Array<{ left: Fingers; right: Fingers }> {
  const current = state.turn === 'p1' ? state.p1 : state.p2;
  const total = current.left + current.right;
  const results: Array<{ left: Fingers; right: Fingers }> = [];

  for (let l = Math.max(0, total - 4); l <= Math.min(total, 4); l++) {
    const r = total - l;
    if (r >= 0 && r <= 4 && isValidTransfer(state, l, r)) {
      results.push({ left: l as Fingers, right: r as Fingers });
    }
  }
  return results;
}
