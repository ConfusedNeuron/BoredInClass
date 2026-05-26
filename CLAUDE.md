# BoredInClass

A web app for students to play games. Built with React + Vite + TypeScript + Tailwind CSS + Firebase.

## Games

| Game | Status | Mode |
|------|--------|------|
| Chopsticks | ✅ Done | Online multiplayer (Firebase room codes) |
| Tic Tac Toe | 🔜 Planned | Online + pass-and-play, match history per opponent |
| Sudoku | 🔜 Planned | Solo + live compete (real-time race), easy/medium/hard |

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
VITE_FIREBASE_MEASUREMENT_ID=
```

Backup of actual values stored at `~/.config/boredinclass/firebase-env-backup.env` (local machine only).

## Firebase Setup

1. Go to https://console.firebase.google.com → New Project
2. Enable **Realtime Database** → Start in test mode for dev
3. Enable **Authentication → Sign-in method → Anonymous**
4. Project Settings → Your Apps → Add Web App → copy config into `.env.local`

## Deploy (Vercel)

1. Push repo to GitHub
2. Import repo at https://vercel.com/new
3. Add all `VITE_FIREBASE_*` env vars in Vercel project settings
4. Auto-deploys on every push to `main`

> **Same WiFi note**: Only useful for `npm run dev` on your machine (share local IP).
> Once on Vercel, anyone with internet can play from anywhere.

## Chopsticks Rules

Two players, each starts with 1 finger on each hand (left and right).

**On your turn, choose ONE action:**

1. **Hit**: Use one of your hands (must have ≥1 finger) to tap one of the opponent's hands (must have ≥1 finger).
   - Opponent's hit hand = `(their fingers + your fingers) mod 5`
   - If result is 0, that hand closes
2. **Transfer**: Redistribute your total fingers between your own two hands.
   - Total must stay the same; each hand must be 0–4
   - Resulting state must differ from before (no wasted moves)

**Win**: Close both of the opponent's hands (both reach 0).

## Known Bugs Fixed

- Firebase `onValue` returns the unsubscribe fn directly (v9 modular). Was calling `off()` with wrong arg → listeners never detached, stacked on replay. Fixed in `useChopsticksRoom.ts`.
- Transfer slider `min` was always 0; when a player's total fingers > 4, the right hand could exceed 4. Fixed slider range to `[max(0, total-4), min(total, 4)]`.

## Project Structure

```
src/
  firebase.ts                   # Firebase init + anonymous auth
  App.tsx                       # BrowserRouter + Layout + Routes
  pages/
    Home.tsx                    # Game picker landing page
  games/
    chopsticks/
      types.ts                  # Fingers, Hand, GameState, Room, Action types
      logic.ts                  # Pure game logic — applyHit, applyTransfer,
                                #   isValidHit, isValidTransfer, getValidTransfers
      ChopsticksPage.tsx        # Route entry — orchestrates lobby/playing/finished states
      Lobby.tsx                 # Create / Join room UI
      Game.tsx                  # Game board — hand display, hit flow, transfer slider
    sudoku/                     # (planned)
    tictactoe/                  # (planned)
  hooks/
    useChopsticksRoom.ts        # Firebase room sync — create, join, makeMove, reset
```

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, deployed |
| `chopstick_improvement` | Chopsticks UX / feature improvements |
