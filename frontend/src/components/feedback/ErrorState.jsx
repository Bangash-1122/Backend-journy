import Button from '@/components/ui/Button';
import { getUserMessage } from '@/lib/errors';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <h3 className="text-base font-semibold">Something went wrong</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{getUserMessage(error)}</p>
      <div className="mt-4 flex gap-2">
        {onRetry ? (
          <Button onClick={onRetry} variant="secondary">
            Retry
          </Button>
        ) : null}
        <Button onClick={() => (window.location.href = '/')}>Go home</Button>
      </div>
    </div>
  );
}
