import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set) => ({
      isPlaying: false,
      volume: 0.8,
      muted: false,
      playbackRate: 1,
      currentTime: 0,
      theatreMode: false,
      autoplay: true,
      setPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume, muted: volume === 0 }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      toggleTheatre: () => set((s) => ({ theatreMode: !s.theatreMode })),
      setAutoplay: (autoplay) => set({ autoplay }),
    }),
    {
      name: 'videohub-player',
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        playbackRate: state.playbackRate,
        autoplay: state.autoplay,
      }),
    },
  ),
);
