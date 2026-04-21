'use client';

import { useState, useEffect } from 'react';
import { DocumentReference, onSnapshot, DocumentData } from 'firebase/firestore';

export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      setData(null);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        const docData = doc.exists() ? ({ ...doc.data(), id: doc.id } as T) : null;
        console.log(`[Firestore Read] Document Update: ${docRef.path}. Exists: ${doc.exists()}`);
        setData(docData);
        setLoading(false);
      },
      (err) => {
        console.error("[Firestore Read] Document Failed:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef?.path]);

  return { data, loading, error };
}
