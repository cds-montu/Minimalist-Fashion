import React from 'react';
import { logWarning, readJSON, writeJSON } from 'core/utils/storage';

export const WishlistContext = React.createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = React.useState(() => {
    const stored = readJSON('wishlist:items', []);
    return Array.isArray(stored) ? stored : [];
  });

  React.useEffect(() => {
    try {
      writeJSON('wishlist:items', items);
    } catch (error) {
      logWarning('WishlistContext:persist', error);
    }
  }, [items]);

  const toggle = (product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  };

  const contains = React.useCallback((id) => items.some((p) => p.id === id), [items]);

  const value = { items, toggle, contains };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = React.useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
