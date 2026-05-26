import { useState } from 'react';
import { useChopsticksRoom } from '../../hooks/useChopsticksRoom';
import { Lobby } from './Lobby';
import { Game } from './Game';

export function ChopsticksPage() {
  const { status, createRoom, joinRoom, makeMove, reset } = useChopsticksRoom();
  const [copied, setCopied] = useState(false);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status.phase === 'idle' || status.phase === 'error') {
    return (
      <Lobby
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        isLoading={false}
        error={status.phase === 'error' ? status.message : undefined}
      />
    );
  }

  if (status.phase === 'creating' || status.phase === 'joining') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">{status.phase === 'creating' ? 'Creating room…' : 'Joining room…'}</p>
      </div>
    );
  }

  if (status.phase === 'waiting') {
    return (
      <div className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto w-full">
        <h2 className="text-2xl font-bold text-white">Room Created!</h2>
        <p className="text-gray-400 text-sm text-center">Share this code with your opponent:</p>
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl font-mono font-black tracking-widest text-indigo-300 select-all">
            {status.code}
          </span>
          <button
            onClick={() => copyCode(status.code)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
          >
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
          Waiting for opponent…
        </div>
        <button onClick={reset} className="text-xs text-gray-600 underline hover:text-gray-400">
          Cancel
        </button>
      </div>
    );
  }

  if (status.phase === 'playing') {
    return (
      <Game
        gameState={status.gameState}
        myRole={status.role}
        onAction={makeMove}
        roomCode={status.code}
      />
    );
  }

  if (status.phase === 'finished') {
    const { gameState, role } = status;
    const iWon = gameState.winner === role;

    return (
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm mx-auto w-full text-center">
        <div className="text-7xl">{iWon ? '🎉' : '😢'}</div>
        <h2 className="text-3xl font-black text-white">{iWon ? 'You Win!' : 'You Lose'}</h2>
        <p className="text-gray-500 text-sm">
          {iWon ? 'You closed both opponent hands!' : 'Both your hands were closed.'}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
