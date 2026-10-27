import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { ref, onValue, set, update, push, remove } from 'firebase/database';

export function useRealtimeValue<T>(path: string, initialValue: T | null = null) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setValue(snapshot.val());
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [path]);

  const write = (data: T) => set(ref(db, path), data);
  const patch = (data: Partial<T>) => update(ref(db, path), data);
  const pushData = (data: T) => push(ref(db, path), data);
  const deleteData = () => remove(ref(db, path));

  return { value, loading, error, write, patch, push: pushData, delete: deleteData };
}

export function useRealtimeArray<T extends { id?: string }>(path: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([key, val]) => ({
          id: key,
          ...(val as object),
        })) as T[];
        setItems(arr);
      } else {
        setItems([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [path]);

  return { items, loading };
}