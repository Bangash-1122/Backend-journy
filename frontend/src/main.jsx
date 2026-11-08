import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { env } from '@/lib/env';
import { applyTheme, useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { fetchCurrentUser } from '@/services/auth.service';
import App from './App.jsx';
import './index.css';

// Apply initial theme
applyTheme(useThemeStore.getState().theme);

// Subscribe to theme changes
useThemeStore.subscribe((state) => {
  applyTheme(state.theme);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

async function prepareApp() {
  if (env.enableMock) {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest(request, print) {
          // Ignore Vite internal requests, static assets, scripts, styles
          if (
            request.url.includes('/@vite') ||
            request.url.includes('/@fs') ||
            request.url.includes('/src/') ||
            request.url.includes('/node_modules/') ||
            request.url.endsWith('.html') ||
            request.url.endsWith('.jsx') ||
            request.url.endsWith('.js') ||
            request.url.endsWith('.css')
          ) {
            return;
          }
          if (request.url.includes('/api/')) {
            print.warning();
          }
        },
      });
    } catch (err) {
      console.warn('MSW worker failed to start:', err);
    }
  }

  // Restore authenticated session AFTER mock service worker has initialized
  const token = useAuthStore.getState().token;
  if (token) {
    try {
      const user = await fetchCurrentUser();
      if (user) useAuthStore.getState().setUser(user);
    } catch {
      useAuthStore.getState().logout();
    }
  }
}

prepareApp().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="bottom-right" richColors closeButton duration={3500} />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
