import React from 'react';
import { logWarning, readJSON, writeJSON } from 'core/utils/storage';

export const NotificationsContext = React.createContext();

const STORAGE_KEY = 'notifications:list';

function load() {
  const stored = readJSON(STORAGE_KEY, []);
  return Array.isArray(stored) ? stored : [];
}
function save(list) {
  try {
    writeJSON(STORAGE_KEY, list);
  } catch (error) {
    logWarning('NotificationsContext:persist', error);
  }
}

export function NotificationsProvider({ children }) {
  const [items, setItems] = React.useState(load);

  const add = React.useCallback((n) => {
    setItems((prev) => {
      const next = [{ id: n.id || Date.now(), title: n.title, body: n.body, read: false, ts: n.ts || Date.now() }, ...prev].slice(0, 50);
      save(next);
      return next;
    });
  }, []);

  const markAllRead = React.useCallback(() => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      save(next);
      return next;
    });
  }, []);

  const remove = React.useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((n) => n.id !== id);
      save(next);
      return next;
    });
  }, []);

  const unread = items.filter((n) => !n.read).length;

  // Simple demo realtime: listen for custom events and add notification
  React.useEffect(() => {
    const handler = (e) => add(e.detail);
    window.addEventListener('notify', handler);
    return () => window.removeEventListener('notify', handler);
  }, [add]);

  const value = { items, add, unread, markAllRead, remove };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationsProvider');
  return context;
}
