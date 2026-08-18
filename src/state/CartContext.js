import React from 'react';

export const CartContext = React.createContext();

export function CartProvider({ children }) {
  const [items, setItems] = React.useState([]);

  const addItem = (product, qty = 1, variant = null) => {
    setItems((prev) => {
      const key = `${product.id}-${variant || 'default'}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { key, product, qty, variant }];
    });
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const updateQty = (key, qty) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  const clear = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const value = { items, addItem, removeItem, updateQty, clear, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
