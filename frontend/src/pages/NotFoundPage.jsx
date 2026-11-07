import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/feedback/EmptyState';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <EmptyState
      title="Page not found"
      description="Try searching for a video, or head back home."
      actionLabel="Go home"
      onAction={() => navigate('/')}
    />
  );
}
