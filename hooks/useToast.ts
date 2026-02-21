import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: any }[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return { toasts, showToast, setToasts };
};