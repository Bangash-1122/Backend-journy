import { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useToggleSubscribe } from '@/hooks/useChannel';
import { useAuthStore } from '@/store/authStore';

export default function SubscribeButton({ channelId, subscribed }) {
  const [hovered, setHovered] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const mutation = useToggleSubscribe();

  const onClick = async () => {
    if (!isAuthenticated) {
      toast.warning('You must sign in to subscribe');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      const result = await mutation.mutateAsync(channelId);
      toast.success(result.subscribed ? 'Subscribed' : 'Unsubscribed');
    } catch (err) {
      toast.error(err.message || 'Could not update subscription');
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        disabled={mutation.isPending}
        className={`h-10 px-4 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          subscribed
            ? 'bg-surface border border-border text-text hover:bg-elevated'
            : 'bg-text text-bg hover:opacity-90'
        }`}
      >
        {mutation.isPending
          ? 'Loading…'
          : subscribed
          ? hovered
            ? 'Unsubscribe'
            : 'Subscribed ✓'
          : 'Subscribe'}
      </button>
    </motion.div>
  );
}
