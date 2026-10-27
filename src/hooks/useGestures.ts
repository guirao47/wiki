import { useEffect, useRef, useCallback } from 'react';
import { db } from '../services/firebase';
import { ref, push } from 'firebase/database';

export interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right';
  timestamp: number;
}

export function useSwipeDetector(
  onSwipe: (dir: SwipeDirection) => void,
  options: { threshold?: number; maxTime?: number } = {}
) {
  const { threshold = 50, maxTime = 300 } = options;
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;

      if (dt > maxTime) {
        touchStart.current = null;
        return;
      }

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < threshold && absY < threshold) {
        touchStart.current = null;
        return;
      }

      let direction: SwipeDirection['direction'];
      if (absX > absY) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }

      onSwipe({ direction, timestamp: Date.now() });
      touchStart.current = null;
    },
    [threshold, maxTime, onSwipe]
  );

  useEffect(() => {
    const el = document.body;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
}

export function useKeyboardListener(onKey: (key: string, event: KeyboardEvent) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      onKey(e.key, e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey]);
}

export function useGestureFirebase(sessionId: string | null) {
  const sendGesture = useCallback(
    (direction: SwipeDirection['direction']) => {
      if (!sessionId) return;
      push(ref(db, `sessions/${sessionId}/gestures`), {
        swipe: direction,
        timestamp: Date.now(),
      });
    },
    [sessionId]
  );

  const sendKey = useCallback(
    (key: string) => {
      if (!sessionId) return;
      push(ref(db, `sessions/${sessionId}/keyboard`), {
        key,
        timestamp: Date.now(),
      });
    },
    [sessionId]
  );

  return { sendGesture, sendKey };
}