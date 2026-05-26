import { useState } from 'react';
import type { Action, GameState, HandSide, Fingers } from './types';
import { isValidHit, isValidTransfer, getValidTransfers } from './logic';

const FINGER_DISPLAY: Record<number, string> = {
  0: '✊',
  1: '☝️',
  2: '✌️',
  3: '🤟',
  4: '🖖',
};

interface HandButtonProps {
  fingers: Fingers;
  label: string;
  onClick?: () => void;
  highlighted?: boolean;
  selected?: boolean;
  disabled?: boolean;
  closed?: boolean;
}

function HandButton({ fingers, label, onClick, highlighted, selected, disabled, closed }: HandButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || closed}
      className={[
        'flex flex-col items-center gap-1 rounded-2xl p-3 w-24 transition-all duration-150 select-none',
        closed
          ? 'opacity-40 cursor-not-allowed bg-gray-800 border-2 border-gray-700'
          : selected
          ? 'bg-indigo-500 border-2 border-indigo-300 scale-110 shadow-lg shadow-indigo-900'
          : highlighted
          ? 'bg-emerald-600 border-2 border-emerald-400 scale-105 shadow-lg shadow-emerald-900 cursor-pointer'
          : disabled
          ? 'bg-gray-800 border-2 border-gray-700 cursor-not-allowed opacity-60'
          : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-500 cursor-pointer active:scale-95',
      ].join(' ')}
    >
      <span className="text-4xl leading-none">{FINGER_DISPLAY[fingers]}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-lg font-bold text-white">{fingers}</span>
    </button>
  );
}

type Phase =
  | { mode: 'idle' }
  | { mode: 'hit-select-attacker' }
  | { mode: 'hit-select-target'; attackerHand: HandSide }
  | { mode: 'transfer' };

interface GameProps {
  gameState: GameState;
  myRole: 'p1' | 'p2';
  onAction: (action: Action) => void;
  roomCode: string;
}

export function Game({ gameState, myRole, onAction, roomCode }: GameProps) {
  const [phase, setPhase] = useState<Phase>({ mode: 'idle' });
  const [transferLeft, setTransferLeft] = useState<number>(0);

  const isMyTurn = gameState.turn === myRole;
  const me = gameState[myRole];
  const opponentRole = myRole === 'p1' ? 'p2' : 'p1';
  const opponent = gameState[opponentRole];

  const myTotal = me.left + me.right;

  function handleHitAttackerSelect(hand: HandSide) {
    setPhase({ mode: 'hit-select-target', attackerHand: hand });
  }

  function handleHitTargetSelect(targetHand: HandSide) {
    if (phase.mode !== 'hit-select-target') return;
    onAction({ type: 'hit', attackerHand: phase.attackerHand, targetHand });
    setPhase({ mode: 'idle' });
  }

  function handleTransferConfirm() {
    const newRight = myTotal - transferLeft;
    if (isValidTransfer(gameState, transferLeft, newRight)) {
      onAction({ type: 'transfer', newLeft: transferLeft as Fingers, newRight: newRight as Fingers });
      setPhase({ mode: 'idle' });
    }
  }

  function startHit() {
    setPhase({ mode: 'hit-select-attacker' });
  }

  function startTransfer() {
    const min = Math.max(0, myTotal - 4);
    const max = Math.min(myTotal, 4);
    setTransferLeft(Math.min(Math.max(me.left, min), max));
    setPhase({ mode: 'transfer' });
  }

  const validTransfers = getValidTransfers(gameState);
  const transferRight = myTotal - transferLeft;
  const transferValid = isValidTransfer(gameState, transferLeft, transferRight);

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-sm mx-auto w-full">
      {/* Room code */}
      <div className="text-xs text-gray-500 font-mono">Room: {roomCode}</div>

      {/* Turn indicator */}
      <div className={[
        'text-sm font-bold px-4 py-2 rounded-full',
        isMyTurn ? 'bg-indigo-900 text-indigo-200' : 'bg-gray-800 text-gray-400',
      ].join(' ')}>
        {isMyTurn ? 'Your turn' : "Opponent's turn"}
      </div>

      {/* Opponent hands */}
      <div className="w-full">
        <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-3">Opponent</p>
        <div className="flex justify-center gap-6">
          {(['left', 'right'] as HandSide[]).map((hand) => {
            const isTarget =
              phase.mode === 'hit-select-target' &&
              isValidHit(gameState, phase.attackerHand, hand);
            return (
              <HandButton
                key={hand}
                fingers={opponent[hand]}
                label={hand}
                closed={opponent[hand] === 0}
                highlighted={isTarget}
                onClick={isTarget ? () => handleHitTargetSelect(hand) : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-800" />

      {/* My hands */}
      <div className="w-full">
        <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-3">You</p>
        <div className="flex justify-center gap-6">
          {(['left', 'right'] as HandSide[]).map((hand) => {
            const isAttacker =
              phase.mode === 'hit-select-attacker' && me[hand] > 0;
            const isSelected =
              phase.mode === 'hit-select-target' && phase.attackerHand === hand;
            return (
              <HandButton
                key={hand}
                fingers={me[hand]}
                label={hand}
                closed={me[hand] === 0}
                selected={isSelected}
                highlighted={isAttacker}
                disabled={!isMyTurn}
                onClick={
                  phase.mode === 'hit-select-attacker' && me[hand] > 0
                    ? () => handleHitAttackerSelect(hand)
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* Action controls */}
      {isMyTurn && (
        <div className="w-full space-y-3">
          {phase.mode === 'idle' && (
            <div className="flex gap-3">
              <button
                onClick={startHit}
                className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition-colors active:scale-95"
              >
                ⚡ Hit
              </button>
              <button
                onClick={startTransfer}
                disabled={validTransfers.length === 0}
                className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors active:scale-95"
              >
                🔄 Transfer
              </button>
            </div>
          )}

          {phase.mode === 'hit-select-attacker' && (
            <div className="text-center">
              <p className="text-sm text-indigo-300 mb-2">Select your attacking hand above</p>
              <button onClick={() => setPhase({ mode: 'idle' })} className="text-xs text-gray-500 underline">
                Cancel
              </button>
            </div>
          )}

          {phase.mode === 'hit-select-target' && (
            <div className="text-center">
              <p className="text-sm text-emerald-300 mb-2">Select opponent hand to hit</p>
              <button onClick={() => setPhase({ mode: 'idle' })} className="text-xs text-gray-500 underline">
                Cancel
              </button>
            </div>
          )}

          {phase.mode === 'transfer' && (
            <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-center text-gray-300 font-medium">
                Redistribute {myTotal} fingers
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-10 text-right">Left</span>
                <input
                  type="range"
                  min={Math.max(0, myTotal - 4)}
                  max={Math.min(myTotal, 4)}
                  value={transferLeft}
                  onChange={(e) => setTransferLeft(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-xs text-gray-400 w-10">Right</span>
              </div>
              <div className="flex justify-center gap-8 text-2xl font-bold">
                <div className="flex flex-col items-center gap-1">
                  <span>{FINGER_DISPLAY[Math.min(transferLeft, 4)]}</span>
                  <span className="text-sm text-gray-400">{transferLeft} left</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span>{FINGER_DISPLAY[Math.min(transferRight, 4)]}</span>
                  <span className="text-sm text-gray-400">{transferRight} right</span>
                </div>
              </div>
              {!transferValid && (
                <p className="text-xs text-red-400 text-center">
                  {transferRight < 0 || transferRight > 4
                    ? 'Each hand must be 0–4'
                    : 'No change — pick a different split'}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setPhase({ mode: 'idle' })}
                  className="flex-1 py-2 rounded-xl bg-gray-700 text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferConfirm}
                  disabled={!transferValid}
                  className="flex-1 py-2 rounded-xl bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isMyTurn && phase.mode === 'idle' && (
        <p className="text-sm text-gray-600 animate-pulse">Waiting for opponent...</p>
      )}
    </div>
  );
}
