// Names of the window-level events the local stores use to notify the UI.
export const APP_EVENTS = {
  productsUpdated: 'products:updated',
  ordersUpdated: 'orders:updated',
  usersUpdated: 'users:updated',
  notify: 'notify',
  storage: 'storage',
};

export function emitAppEvent(name, detail) {
  try {
    if (typeof window === 'undefined' || !window.dispatchEvent) return;
    window.dispatchEvent(new CustomEvent(name, detail === undefined ? undefined : { detail }));
  } catch {
    // ignore environments without CustomEvent support
  }
}
