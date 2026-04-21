'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          console.log(`[AUTH] Session Established. UID: ${currentUser.uid}`);
          setUser(currentUser);
          setLoading(false);
        } else {
          console.log("[AUTH] No session, attempting anonymous login...");
          try {
            const anon = await signInAnonymously(auth);
            console.log(`[AUTH] Anonymous Session Active. UID: ${anon.user.uid}`);
            setUser(anon.user);
          } catch (err: any) {
            console.error("[AUTH] Initialization Error:", err.message);
            setError(err);
          } finally {
            setLoading(false);
          }
        }
      },
      (err) => {
        console.error("[AUTH] Observer Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, error };
}
