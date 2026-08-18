import React from 'react';
import { readArray, writeJSON } from 'core/utils/storage';
import { APP_EVENTS } from 'core/utils/appEvents';
import { useWindowEvent } from 'hooks/useWindowEvent';

export const NotificationsContext = React.createContext();

const STORAGE_KEY = 'notifications:list';

function load() {
  return readArray(STORAGE_KEY);
}
function save(list) {
  writeJSON(STORAGE_KEY, list);
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
  useWindowEvent(APP_EVENTS.notify, (e) => add(e.detail));

  const value = { items, add, unread, markAllRead, remove };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  return React.useContext(NotificationsContext);
}
