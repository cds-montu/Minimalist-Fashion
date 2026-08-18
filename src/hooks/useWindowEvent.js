import React from 'react';

// Subscribes to a window event for the lifetime of the component.
export function useWindowEvent(eventName, handler) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    if (typeof window === 'undefined' || !eventName) return undefined;
    const listener = (event) => handlerRef.current?.(event);
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName]);
}

export default useWindowEvent;
