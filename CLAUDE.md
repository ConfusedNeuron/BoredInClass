# BoredInClass

A web app for students to play games. Built with React + Vite + TypeScript + Tailwind CSS + Firebase.

## Games

- **Chopsticks** — 2-player online finger-count game
- **Tic Tac Toe** — (coming soon)
- **Sudoku** — (coming soon)

## Dev Setup

```bash
npm install
cp .env.example .env.local
# Fill in Firebase config in .env.local
npm run dev
```

## Environment Variables

All Firebase config goes in `.env.local` (never commit this file):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase Setup

1. Go to https://console.firebase.google.com → New Project
2. Enable **Realtime Database** (Start in test mode for dev)
3. Enable **Authentication → Anonymous** provider
4. Copy the config into `.env.local`

## Deploy (Vercel)

1. Push repo to GitHub
2. Import repo at https://vercel.com/new
3. Add env vars from `.env.local` in Vercel project settings
4. Auto-deploys on every push to main

## Chopsticks Rules

Two players, each starts with 1 finger on each hand (left and right).

**On your turn, choose ONE action:**

1. **Hit**: Use one of your hands (must have ≥1 finger) to hit one of the opponent's hands (must have ≥1 finger).
   - Opponent's hit hand += your attacking hand's count, then `mod 5`
   - If result is 0, that hand closes
2. **Transfer**: Redistribute your total fingers between your own two hands.
   - Sum must stay the same, each hand must be 0–4
   - Resulting state must differ from current state (no wasted moves)

**Win**: Make both of the opponent's hands reach 0 (closed).

## Project Structure

```
src/
  firebase.ts              # Firebase init + anonymous auth
  App.tsx                  # Router
  pages/Home.tsx           # Game picker
  games/chopsticks/
    types.ts               # GameState, PlayerState types
    logic.ts               # Pure game logic (applyHit, applyTransfer, etc.)
    ChopsticksPage.tsx     # Route entry
    Lobby.tsx              # Create/Join room UI
    Game.tsx               # Game board UI
  hooks/
    useChopsticksRoom.ts   # Firebase sync hook
```
