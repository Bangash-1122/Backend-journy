import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    toast.warning('Please sign in to continue');
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}
