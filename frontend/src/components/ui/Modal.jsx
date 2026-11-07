import { useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export default function Modal({ title, open, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button className="absolute inset-0 bg-black/60" aria-label="Close dialog" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-[480px] rounded-t-2xl sm:rounded-2xl bg-surface border border-border shadow-[var(--shadow)]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="size-11 grid place-items-center rounded-full hover:bg-elevated" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="px-5 py-4 border-t border-border flex justify-end gap-2">{footer}</div> : null}
      </motion.div>
    </div>
  );
}
