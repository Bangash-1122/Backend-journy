import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes/routes';
import Skeleton from './components/ui/Skeleton';

function PageFallback() {
  return (
    <div className="space-y-4 p-4 md:p-6 max-w-[1600px] mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const content = useRoutes(routes);

  return <Suspense fallback={<PageFallback />}>{content}</Suspense>;
}
