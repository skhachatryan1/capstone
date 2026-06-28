import { useState, useCallback } from 'react';

let id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const tid = ++id;
    setToasts(prev => [...prev, { id: tid, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== tid));
    }, 3500);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return { toasts, toast };
}
