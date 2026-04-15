import { AnimatePresence, motion } from "framer-motion";
import type { Toast, ToastType } from "../../hooks/useToast";

/** Maps toast type to visual style tokens */
const STYLE_MAP: Record<
  ToastType,
  { bg: string; text: string; border: string; symbol: string }
> = {
  join: {
    bg: "bg-brand-yellow-acid",
    text: "text-brand-text-dark",
    border: "border-brand-text-dark",
    symbol: "+",
  },
  leave: {
    bg: "bg-brand-purple-vivid",
    text: "text-white",
    border: "border-brand-text-dark",
    symbol: "−",
  },
  info: {
    bg: "bg-white",
    text: "text-brand-text-dark",
    border: "border-brand-text-dark",
    symbol: "i",
  },
  error: {
    bg: "bg-red-600",
    text: "text-white",
    border: "border-brand-text-dark",
    symbol: "!",
  },
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

/** Single toast notification pill */
function ToastItem({ toast, onRemove }: ToastItemProps) {
  const styles = STYLE_MAP[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`
        flex items-center gap-4 px-5 py-3
        border-4 ${styles.border} ${styles.bg}
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        cursor-pointer select-none
        min-w-[260px] max-w-[420px]
      `}
      onClick={() => onRemove(toast.id)}
      role="alert"
      aria-live="polite"
    >
      {/* Symbol badge */}
      <span
        className={`
          font-['Barlow_Condensed'] font-black text-2xl leading-none
          w-7 h-7 flex items-center justify-center shrink-0
          border-2 ${styles.border} ${styles.text}
        `}
      >
        {styles.symbol}
      </span>

      {/* Message */}
      <span
        className={`
          font-['Barlow_Condensed'] font-black text-lg uppercase tracking-wider
          leading-tight ${styles.text}
        `}
      >
        {toast.message}
      </span>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

/**
 * Renders the active toast stack in the bottom-right corner of the screen.
 * Mount this once at the top of your layout (e.g. inside `MeetingRoom`).
 *
 * @param toasts   - The live toast array from `useToast`.
 * @param onRemove - Callback to manually dismiss a toast by id.
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
