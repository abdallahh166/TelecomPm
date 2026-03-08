import { Button } from '@/components/ui/button';

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="space-y-3 p-6">
      <p className="text-sm text-brand-red">{message}</p>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
