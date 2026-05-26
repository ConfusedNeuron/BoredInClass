import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  emoji: string;
  description: string;
  to: string;
  available: boolean;
}

function GameCard({ title, emoji, description, to, available }: GameCardProps) {
  const inner = (
    <div className={[
      'flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all duration-150',
      available
        ? 'border-gray-700 bg-gray-900 hover:border-indigo-500 hover:bg-gray-800 cursor-pointer active:scale-95'
        : 'border-gray-800 bg-gray-900/40 cursor-not-allowed opacity-50',
    ].join(' ')}>
      <span className="text-4xl">{emoji}</span>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      {!available && (
        <span className="text-xs text-gray-600 font-medium">Coming soon</span>
      )}
    </div>
  );

  return available ? <Link to={to}>{inner}</Link> : <div>{inner}</div>;
}

export function Home() {
  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-md mx-auto w-full">
      <div className="text-center pt-4">
        <h1 className="text-4xl font-black text-white tracking-tight">BoredInClass</h1>
        <p className="text-gray-500 mt-2 text-sm">Games to play when you probably shouldn't be</p>
      </div>

      <div className="w-full grid gap-3">
        <GameCard
          title="Chopsticks"
          emoji="✌️"
          description="2-player finger game — close both opponent's hands to win"
          to="/chopsticks"
          available={true}
        />
        <GameCard
          title="Tic Tac Toe"
          emoji="⭕"
          description="Classic X's and O's with match history"
          to="/tictactoe"
          available={false}
        />
        <GameCard
          title="Sudoku"
          emoji="🔢"
          description="Easy to Hard — with hints, notes, and live compete mode"
          to="/sudoku"
          available={false}
        />
      </div>

      <p className="text-xs text-gray-700 text-center pb-4">
        All games work on mobile, tablet, and desktop.
      </p>
    </div>
  );
}
