import { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAddToPlaylist, useCreatePlaylist, usePlaylists } from '@/hooks/usePlaylists';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

export default function AddToPlaylistModal() {
  const user = useAuthStore((s) => s.user);
  const active = useUiStore((s) => s.activeModal);
  const payload = useUiStore((s) => s.modalPayload);
  const closeModal = useUiStore((s) => s.closeModal);
  const { data: playlists = [] } = usePlaylists(user?.id);
  const add = useAddToPlaylist(user?.id);
  const create = useCreatePlaylist(user?.id);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState({});

  const open = active === 'add-to-playlist';

  const filteredPlaylists = search.trim()
    ? playlists.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : playlists;

  const save = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    await Promise.all(ids.map((playlistId) => add.mutateAsync({ playlistId, videoId: payload?.videoId })));
    toast.success('Added to playlist');
    closeModal();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title="Save to playlist"
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search playlists…"
          className="h-9 w-full rounded-lg border border-border bg-bg px-3 text-sm placeholder:text-muted"
        />
      </div>
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {filteredPlaylists.map((p) => (
          <label key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-elevated cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(selected[p.id])}
              onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.target.checked }))}
            />
            <span className="text-sm">{p.name}</span>
          </label>
        ))}
        {filteredPlaylists.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted">No playlists found</p>
        ) : null}
      </div>
      <form
        className="mt-4 flex gap-2 border-t border-border pt-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await create.mutateAsync({ name, description: ' ' });
          setName('');
          toast.success('Playlist created');
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Create new playlist"
          className="h-10 flex-1 rounded-lg border border-border bg-bg px-3 text-sm"
        />
        <Button type="submit" variant="secondary">
          Create
        </Button>
      </form>
    </Modal>
  );
}
