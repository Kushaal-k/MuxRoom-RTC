import { useState, useCallback } from "react";

export type ToastType = "join" | "leave" | "info" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Hook that provides toast notification state and controls.
 * Returns the active toasts array and a `addToast` trigger function.
 *
 * @param duration - How long (ms) each toast stays visible. Defaults to 3500ms.
 */
export function useToast(duration = 3500) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [duration]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
