import { AnimatePresence, motion } from "framer-motion";
import type { Toast, ToastType } from "../../hooks/useToast";
import { GlassContainer } from "./GlassContainer";

/** Maps toast type to visual style tokens */
const STYLE_MAP: Record<
  ToastType,
  { bg: string; text: string; icon: string }
> = {
  join: {
    bg: "bg-white",
    text: "text-black",
    icon: "○",
  },
  leave: {
    bg: "bg-white/10",
    text: "text-white/60",
    icon: "×",
  },
  info: {
    bg: "bg-white/5",
    text: "text-white",
    icon: "●",
  },
  error: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    icon: "!",
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
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pointer-events-auto"
    >
      <GlassContainer 
        className={`
          flex items-center gap-4 px-6 py-4 rounded-2xl
          cursor-pointer select-none
          min-w-[300px] max-w-[420px]
          ${styles.bg} border-white/10
        `}
        onClick={() => onRemove(toast.id)}
        hoverEffect
      >
        {/* Icon */}
        <span
          className={`
            font-display font-bold text-xl leading-none
            w-8 h-8 flex items-center justify-center shrink-0
            rounded-full border border-white/10 ${styles.text}
          `}
        >
          {styles.icon}
        </span>

        {/* Message */}
        <span
          className={`
            font-display font-bold text-sm uppercase tracking-widest
            leading-tight ${styles.text}
          `}
        >
          {toast.message}
        </span>
      </GlassContainer>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

/**
 * Renders the active toast stack in the bottom-right corner of the screen.
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-10 right-10 z-100 flex flex-col gap-4 items-end pointer-events-none"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
