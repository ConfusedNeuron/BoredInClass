import { useState } from 'react';

interface LobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  isLoading: boolean;
  error?: string;
}

export function Lobby({ onCreateRoom, onJoinRoom, isLoading, error }: LobbyProps) {
  const [code, setCode] = useState('');
  const [tab, setTab] = useState<'create' | 'join'>('create');

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length === 6) onJoinRoom(code);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-center text-white">✌️ Chopsticks</h1>
        <p className="text-sm text-gray-500 text-center mt-1">2-player finger game</p>
      </div>

      {/* Tab switcher */}
      <div className="flex w-full rounded-xl bg-gray-800 p-1 gap-1">
        {(['create', 'join'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-colors',
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white',
            ].join(' ')}
          >
            {t === 'create' ? 'Create Room' : 'Join Room'}
          </button>
        ))}
      </div>

      {tab === 'create' ? (
        <div className="w-full space-y-4">
          <p className="text-sm text-gray-400 text-center">
            Start a new room and share the code with your opponent.
          </p>
          <button
            onClick={onCreateRoom}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-lg transition-colors active:scale-95"
          >
            {isLoading ? 'Creating…' : 'Create Room'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleJoin} className="w-full space-y-4">
          <p className="text-sm text-gray-400 text-center">
            Enter the 6-character code your opponent shared.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="XXXXXX"
            maxLength={6}
            className="w-full py-4 px-5 text-center text-2xl font-mono tracking-widest rounded-2xl bg-gray-800 border-2 border-gray-700 focus:border-indigo-500 outline-none text-white placeholder-gray-600 uppercase transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || code.trim().length !== 6}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-lg transition-colors active:scale-95"
          >
            {isLoading ? 'Joining…' : 'Join Room'}
          </button>
        </form>
      )}

      {error && (
        <div className="w-full py-3 px-4 rounded-xl bg-red-900/50 border border-red-700 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Rules summary */}
      <details className="w-full">
        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 text-center">
          How to play
        </summary>
        <div className="mt-3 text-xs text-gray-500 space-y-2 bg-gray-800/50 rounded-xl p-4">
          <p>Each player starts with <strong className="text-gray-300">1 finger</strong> on each hand.</p>
          <p><strong className="text-gray-300">Hit:</strong> Use your hand to hit opponent's hand. Their fingers increase by yours, then mod 5. If it hits 0 — hand closes.</p>
          <p><strong className="text-gray-300">Transfer:</strong> Redistribute your total fingers between your two hands (must change state).</p>
          <p><strong className="text-gray-300">Win:</strong> Close both of opponent's hands.</p>
        </div>
      </details>
    </div>
  );
}
