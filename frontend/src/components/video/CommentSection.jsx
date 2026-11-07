import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { commentSchema } from '@/lib/validators';
import { confirmDelete } from '@/lib/confirm';
import { useAddComment, useComments, useDeleteComment } from '@/hooks/useComments';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import CommentItem from './CommentItem';
import Skeleton from '@/components/ui/Skeleton';

export default function CommentSection({ videoId }) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useComments(videoId);
  const add = useAddComment(videoId);
  const remove = useDeleteComment(videoId);
  const form = useForm({ resolver: zodResolver(commentSchema), defaultValues: { text: '' } });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!user) {
      toast.warning('You must sign in to comment');
      return;
    }
    try {
      await add.mutateAsync(values.text);
      form.reset();
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.message || 'Comment failed');
    }
  });

  return (
    <section className="mt-6">
      <h3 className="mb-4 text-base font-semibold">{data?.total ?? data?.items?.length ?? 0} Comments</h3>
      <form onSubmit={onSubmit} className="mb-4 flex gap-3">
        <Avatar src={user?.avatar} name={user?.fullName || 'You'} size={36} />
        <input
          {...form.register('text')}
          placeholder="Add a comment…"
          className="h-10 flex-1 rounded-full border border-border bg-surface px-4 text-sm"
        />
      </form>
      {form.formState.errors.text ? <p className="mb-2 text-xs text-danger">{form.formState.errors.text.message}</p> : null}
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="mb-3 h-16" />)
        : data?.items?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={user && (comment.owner?.id === user.id || comment.owner?.username === user.username)}
              onDelete={async (id) => {
                if (await confirmDelete({ title: 'Delete this comment?', text: 'This cannot be undone.' })) {
                  await remove.mutateAsync(id);
                  toast.success('Comment deleted');
                }
              }}
            />
          ))}
    </section>
  );
}
