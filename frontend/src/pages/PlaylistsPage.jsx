import { useState } from 'react';
import { ListVideo } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { playlistSchema } from '@/lib/validators';
import { confirmDelete } from '@/lib/confirm';
import { useAuthStore } from '@/store/authStore';
import { useCreatePlaylist, useDeletePlaylist, usePlaylists } from '@/hooks/usePlaylists';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TextField from '@/components/forms/TextField';
import TextAreaField from '@/components/forms/TextAreaField';

export default function PlaylistsPage() {
  const user = useAuthStore((s) => s.user);
  const query = usePlaylists(user?.id);
  const create = useCreatePlaylist(user?.id);
  const remove = useDeletePlaylist(user?.id);
  const [open, setOpen] = useState(false);
  const form = useForm({ resolver: zodResolver(playlistSchema), defaultValues: { name: '', description: '', visibility: 'public' } });

  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Playlists</h1>
        <Button onClick={() => setOpen(true)}>Create playlist</Button>
      </div>
      {!query.isLoading && !query.data?.length ? (
        <EmptyState icon={ListVideo} title="No playlists yet" description="Create one to save videos." actionLabel="Create one" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {(query.data || []).map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onMenu={async () => {
                if (await confirmDelete({ title: 'Delete this playlist?', text: 'This cannot be undone.' })) {
                  await remove.mutateAsync(playlist.id);
                  toast.success('Playlist deleted');
                }
              }}
            />
          ))}
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create playlist"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(async (values) => {
                await create.mutateAsync(values);
                toast.success('Playlist created');
                setOpen(false);
                form.reset();
              })}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <TextField label="Title" {...form.register('name')} error={form.formState.errors.name?.message} />
          <TextAreaField label="Description" {...form.register('description')} />
          <select {...form.register('visibility')} className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm">
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
