import { useEffect, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { db } from '../services/firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';

export type SearchEngine = 'web' | 'images' | 'maps' | 'youtube' | 'news' | 'shopping' | 'wikipedia';

export interface SessionData {
  id: string;
  magician?: { connected: boolean; lastSeen: number };
  spectator?: { connected: boolean; currentQuery: string };
  accomplice?: { connected: boolean };
  control?: { forcedQuery: string; searchEngine: SearchEngine; timestamp: number };
  gestures?: Array<{ swipe: string; timestamp: number }>;
  keyboard?: Array<{ key: string; timestamp: number }>;
  createdAt: number;
}

export function createSessionId(): string {
  return nanoid(8);
}

export function useSession(sessionId: string | null, role: 'magician' | 'spectator' | 'accomplice') {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const path = `sessions/${sessionId}`;
    const dbRef = ref(db, path);

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Ensure searchEngine defaults to 'web' for backward compatibility
          if (data.control && !data.control.searchEngine) {
            data.control.searchEngine = 'web';
          }
          setSession({ ...data, id: sessionId });
        } else {
          setSession(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Mark connection
    const roleRef = ref(db, `${path}/${role}`);
    set(roleRef, { connected: true, lastSeen: Date.now() });

    // Heartbeat
    const interval = setInterval(() => {
      update(roleRef, { lastSeen: Date.now() });
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      update(roleRef, { connected: false });
    };
  }, [sessionId, role]);

  const setForcedQuery = useCallback(
    (query: string) => {
      if (!sessionId) return;
      update(ref(db, `sessions/${sessionId}/control`), { forcedQuery: query, timestamp: Date.now() });
    },
    [sessionId]
  );

  const setSearchEngine = useCallback(
    (engine: SearchEngine) => {
      if (!sessionId) return;
      update(ref(db, `sessions/${sessionId}/control`), { searchEngine: engine });
    },
    [sessionId]
  );

  const clearForcedQuery = useCallback(() => {
    if (!sessionId) return;
    update(ref(db, `sessions/${sessionId}/control`), { forcedQuery: '', timestamp: Date.now() });
  }, [sessionId]);

  const updateSpectator = useCallback(
    (data: { connected?: boolean; currentQuery?: string }) => {
      if (!sessionId) return;
      update(ref(db, `sessions/${sessionId}/spectator`), data);
    },
    [sessionId]
  );

  const clearSession = useCallback(() => {
    if (!sessionId) return;
    remove(ref(db, `sessions/${sessionId}`));
  }, [sessionId]);

  const createFixed = useCallback(async (fixedId = 'search') => {
    const path = `sessions/${fixedId}`;
    await set(ref(db, path), {
      magician: { connected: true, lastSeen: Date.now() },
      spectator: { connected: false, currentQuery: '' },
      accomplice: { connected: false },
      control: { forcedQuery: '', searchEngine: 'web' as SearchEngine, timestamp: 0 },
      gestures: [],
      keyboard: [],
      createdAt: Date.now(),
    });
    return fixedId;
  }, []);

  return { session, loading, error, setForcedQuery, setSearchEngine, clearForcedQuery, updateSpectator, clearSession, createFixed };
}

export function useCreateSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const create = useCallback(async () => {
    const id = createSessionId();
    const path = `sessions/${id}`;
    await set(ref(db, path), {
      magician: { connected: true, lastSeen: Date.now() },
      spectator: { connected: false, currentQuery: '' },
      accomplice: { connected: false },
      control: { forcedQuery: '', searchEngine: 'web' as SearchEngine, timestamp: 0 },
      gestures: [],
      keyboard: [],
      createdAt: Date.now(),
    });
    setSessionId(id);
    return id;
  }, []);

  const createFixed = useCallback(async (fixedId = 'search') => {
    const path = `sessions/${fixedId}`;
    await set(ref(db, path), {
      magician: { connected: true, lastSeen: Date.now() },
      spectator: { connected: false, currentQuery: '' },
      accomplice: { connected: false },
      control: { forcedQuery: '', searchEngine: 'web' as SearchEngine, timestamp: 0 },
      gestures: [],
      keyboard: [],
      createdAt: Date.now(),
    });
    return fixedId;
  }, []);

  return { sessionId, create, createFixed };
}