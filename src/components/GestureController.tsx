import { useKeyboardListener, useGestureFirebase } from '../hooks/useGestures';
import { useEffect, useRef } from 'react';

interface GestureControllerProps {
  sessionId: string | null;
  enabled?: boolean;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export function GestureController({ sessionId, enabled = true, onSwipe }: GestureControllerProps) {
  const { sendGesture, sendKey } = useGestureFirebase(sessionId);
  const swipeHandlerRef = useRef<((direction: 'up' | 'down' | 'left' | 'right') => void) | null>(null);

  // Update the swipe handler ref when onSwipe changes
  useEffect(() => {
    swipeHandlerRef.current = onSwipe ?? null;
  }, [onSwipe]);

  // Swipe detection on document body (not blocking overlay)
  useEffect(() => {
    if (!enabled || !sessionId) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Ignore if touching interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, a, [role="button"]')) {
        return;
      }

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === 0 && touchStartY === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      // Ignore if too slow or too short
      if (deltaTime > 300) return;
      if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return;

      let direction: 'up' | 'down' | 'left' | 'right';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      // Call local callback
      if (swipeHandlerRef.current) {
        swipeHandlerRef.current(direction);
      }

      // Send to Firebase
      sendGesture(direction);
    };

    // Listen on document body (not blocking overlay)
    document.body.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.body.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.body.removeEventListener('touchstart', handleTouchStart);
      document.body.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, sessionId, sendGesture]);

  // Keyboard listener
  useKeyboardListener((key) => {
    if (enabled) sendKey(key);
  });

  // No visual overlay - just event listeners
  return null;
}