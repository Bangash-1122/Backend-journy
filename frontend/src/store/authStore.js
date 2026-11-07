import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: Boolean(token && user),
        }),
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'videohub-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const getToken = () => useAuthStore.getState().token;
export const getRefreshToken = () => useAuthStore.getState().refreshToken;
export const clearSession = () => useAuthStore.getState().logout();
