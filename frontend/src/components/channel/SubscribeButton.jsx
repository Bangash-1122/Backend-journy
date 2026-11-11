import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useToggleSubscribe } from '@/hooks/useChannel';
import { useAuthStore } from '@/store/authStore';
import { env } from '@/lib/env';

export default function SubscribeButton({ channelId, subscribed }) {
  const [hovered, setHovered] = useState(false);
  const [overrideSubscribed, setOverrideSubscribed] = useState(null);
  const [prevSubscribed, setPrevSubscribed] = useState(subscribed);

  if (subscribed !== prevSubscribed) {
    setPrevSubscribed(subscribed);
    setOverrideSubscribed(null);
  }

  const isSubscribed = overrideSubscribed !== null ? overrideSubscribed : Boolean(subscribed);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const mutation = useToggleSubscribe();
  const btnRef = useRef(null);

  const onClick = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!user) {
      if (env.enableMock) {
        useAuthStore.getState().login(
          {
            id: 'u-demo',
            username: 'videohub',
            fullName: 'VideoHub Demo',
            avatar: 'https://i.pravatar.cc/160?img=12',
          },
          'demo-token',
          'demo-refresh',
        );
      } else {
        toast.warning('You must sign in to subscribe');
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
    }

    const nextState = !isSubscribed;
    setOverrideSubscribed(nextState);

    // GSAP Spring Pop Animation
    if (btnRef.current) {
      gsap.timeline()
        .to(btnRef.current, { scale: 0.88, duration: 0.1, ease: 'power1.in' })
        .to(btnRef.current, { scale: 1.08, duration: 0.2, ease: 'back.out(2.5)' })
        .to(btnRef.current, { scale: 1, duration: 0.15, ease: 'power1.out' });
    }

    try {
      const res = await mutation.mutateAsync(channelId);
      const serverSub = typeof res?.isSubscribed === 'boolean' ? res.isSubscribed : nextState;
      setOverrideSubscribed(serverSub);
      toast.success(serverSub ? 'Subscribed to channel!' : 'Unsubscribed');
    } catch (err) {
      setOverrideSubscribed(!nextState);
      toast.error(err?.message || 'Could not update subscription');
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      disabled={mutation.isPending}
      className={`h-9 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
        isSubscribed
          ? 'bg-surface border border-border text-text hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400'
          : 'bg-text text-bg hover:opacity-90 active:scale-[0.98]'
      }`}
    >
      {isSubscribed ? (hovered ? 'Unsubscribe' : 'Subscribed ✓') : 'Subscribe'}
    </button>
  );
}
