'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Property } from '@/types/property';

interface CompareContextType {
  items: Property[];
  add: (p: Property) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Property[]>([]);

  const add = (p: Property) => {
    if (items.length >= 3 || items.find(i => i.id === p.id)) return;
    setItems(prev => [...prev, p]);
  };
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const has = (id: string) => items.some(i => i.id === id);
  const clear = () => setItems([]);

  return (
    <CompareContext.Provider value={{ items, add, remove, has, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};
