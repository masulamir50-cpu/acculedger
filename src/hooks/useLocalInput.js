import { useState, useEffect, useRef } from 'react';

/**
 * Debounced input hook — keeps local UI value in sync immediately
 * while deferring the expensive save callback by `delay` ms.
 * Prevents Firestore re-renders from closing the mobile keyboard.
 */
export function useLocalInput(initialValue, onSave, delay = 800) {
  const [local, setLocal] = useState(initialValue);
  const timer   = useRef(null);
  const savedRef = useRef(initialValue);
  const saveRef  = useRef(onSave);
  saveRef.current = onSave;

  // Sync if the external value changes (e.g. another device updates Firestore)
  useEffect(() => {
    setLocal(initialValue);
    savedRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    if (local === savedRef.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      savedRef.current = local;
      saveRef.current(local);
    }, delay);
    return () => clearTimeout(timer.current);
  }, [local, delay]);

  return [local, setLocal];
}
