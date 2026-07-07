'use client';

import { useCallback, useEffect, useState } from 'react';
import { hashEmail } from '@/lib/hash';

export interface SavedAddress {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface SavedUserData {
  name: string;
  phone: string;
  address: SavedAddress;
}

const STORAGE_PREFIX = 'al_user_';

export function useUserData(email: string) {
  const [saved, setSaved] = useState<SavedUserData | null>(null);

  const key = email ? `${STORAGE_PREFIX}${hashEmail(email)}` : null;

  useEffect(() => {
    if (!key) { setSaved(null); return; }
    try {
      const raw = localStorage.getItem(key);
      if (raw) setSaved(JSON.parse(raw));
      else setSaved(null);
    } catch { setSaved(null); }
  }, [key]);

  const save = useCallback((data: SavedUserData) => {
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
    setSaved(data);
  }, [key]);

  return { saved, save };
}
