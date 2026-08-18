import React from 'react';
import { readArray, writeJSON } from 'core/utils/storage';

export const WishlistContext = React.createContext();

const STORAGE_KEY = 'wishlist:items';

export function WishlistProvider({ children }) {
  const [items, setItems] = React.useState(() => readArray(STORAGE_KEY));

  React.useEffect(() => {
    writeJSON(STORAGE_KEY, items);
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
  return React.useContext(WishlistContext);
}
