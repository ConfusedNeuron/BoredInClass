import { useEffect, useRef, useState } from 'react';
import { ref, set, onValue, get } from 'firebase/database';
import { db, ensureAnonymousAuth } from '../firebase';
import { INITIAL_GAME_STATE, applyAction } from '../games/chopsticks/logic';
import type { Action, GameState, Room } from '../games/chopsticks/types';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export type RoomStatus =
  | { phase: 'idle' }
  | { phase: 'creating' }
  | { phase: 'waiting'; code: string; role: 'p1' }
  | { phase: 'joining' }
  | { phase: 'playing'; code: string; role: 'p1' | 'p2'; gameState: GameState }
  | { phase: 'finished'; code: string; role: 'p1' | 'p2'; gameState: GameState }
  | { phase: 'error'; message: string };

export function useChopsticksRoom() {
  const [status, setStatus] = useState<RoomStatus>({ phase: 'idle' });
  const unsubRef = useRef<(() => void) | null>(null);
  const uidRef = useRef<string | null>(null);

  useEffect(() => {
    ensureAnonymousAuth().then((uid) => {
      uidRef.current = uid;
    });
    return () => {
      unsubRef.current?.();
    };
  }, []);

  function subscribe(code: string, role: 'p1' | 'p2') {
    unsubRef.current?.();

    const unsub = onValue(ref(db, `rooms/${code}`), (snap) => {
      const room: Room | null = snap.val();
      if (!room) return;

      const { gameState } = room;
      if (gameState.status === 'finished') {
        setStatus({ phase: 'finished', code, role, gameState });
      } else if (gameState.status === 'playing' && room.p2Id) {
        setStatus({ phase: 'playing', code, role, gameState });
      } else {
        setStatus({ phase: 'waiting', code, role: 'p1' });
      }
    });

    unsubRef.current = unsub;
  }

  async function createRoom() {
    setStatus({ phase: 'creating' });
    try {
      const uid = uidRef.current ?? (await ensureAnonymousAuth());
      uidRef.current = uid;

      let code = generateCode();
      // Ensure unique code
      for (let i = 0; i < 5; i++) {
        const snap = await get(ref(db, `rooms/${code}`));
        if (!snap.exists()) break;
        code = generateCode();
      }

      const room: Room = {
        gameState: { ...INITIAL_GAME_STATE, status: 'waiting' },
        p1Id: uid,
        p2Id: null,
        createdAt: Date.now(),
      };

      await set(ref(db, `rooms/${code}`), room);
      subscribe(code, 'p1');
    } catch (e) {
      setStatus({ phase: 'error', message: String(e) });
    }
  }

  async function joinRoom(code: string) {
    setStatus({ phase: 'joining' });
    try {
      const uid = uidRef.current ?? (await ensureAnonymousAuth());
      uidRef.current = uid;

      const upperCode = code.toUpperCase().trim();
      const snap = await get(ref(db, `rooms/${upperCode}`));

      if (!snap.exists()) {
        setStatus({ phase: 'error', message: 'Room not found. Check the code and try again.' });
        return;
      }

      const room: Room = snap.val();

      if (room.p2Id && room.p2Id !== uid) {
        setStatus({ phase: 'error', message: 'Room is full.' });
        return;
      }

      // Join as p2 and start the game
      await set(ref(db, `rooms/${upperCode}/p2Id`), uid);
      await set(ref(db, `rooms/${upperCode}/gameState`), {
        ...INITIAL_GAME_STATE,
        status: 'playing',
      });

      subscribe(upperCode, 'p2');
    } catch (e) {
      setStatus({ phase: 'error', message: String(e) });
    }
  }

  async function makeMove(action: Action) {
    if (status.phase !== 'playing') return;
    const { code, role, gameState } = status;

    const myTurn = gameState.turn === role;
    if (!myTurn) return;

    const newState = applyAction(gameState, action);
    await set(ref(db, `rooms/${code}/gameState`), newState);
  }

  function reset() {
    unsubRef.current?.();
    unsubRef.current = null;
    setStatus({ phase: 'idle' });
  }

  return { status, createRoom, joinRoom, makeMove, reset };
}
