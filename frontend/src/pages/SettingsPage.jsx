import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { passwordSchema, profileSchema } from '@/lib/validators';
import { changePassword, updateAccount, updateAvatar, updateCoverImage } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { usePlayerStore } from '@/store/playerStore';
import TextField from '@/components/forms/TextField';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'account';
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { theme, setTheme, reduceMotion, setReduceMotion } = useTheme();
  const autoplay = usePlayerStore((s) => s.autoplay);
  const setAutoplay = usePlayerStore((s) => s.setAutoplay);
  const profile = useForm({ resolver: zodResolver(profileSchema), values: { fullName: user?.fullName || '', email: user?.email || '' } });
  const password = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' } });

  if (tab === 'appearance') {
    return (
      <section>
        <h2 className="text-xl font-bold">Appearance</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 max-w-lg">
          {['dark', 'light'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`rounded-xl border p-4 text-left ${theme === mode ? 'border-brand' : 'border-border'}`}
            >
              <div className={`mb-3 h-20 rounded-lg ${mode === 'dark' ? 'bg-[#0F0F0F]' : 'bg-white border'}`} />
              <p className="font-semibold capitalize">{mode}</p>
            </button>
          ))}
        </div>
        <label className="mt-6 flex items-center gap-3 text-sm">
          <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
          Reduce motion
        </label>
        <Button className="mt-4" onClick={() => toast.success('Saved')}>
          Save
        </Button>
      </section>
    );
  }

  if (tab === 'channel') {
    return (
      <section className="max-w-lg space-y-4">
        <h2 className="text-xl font-bold">Channel</h2>
        <p className="text-sm text-muted">@{user?.username}</p>
        <label className="block text-sm">
          Avatar
          <input
            type="file"
            accept="image/*"
            className="mt-2 block"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const next = await updateAvatar(file);
              setUser(next);
              toast.success('Saved');
            }}
          />
        </label>
        <label className="block text-sm">
          Banner
          <input
            type="file"
            accept="image/*"
            className="mt-2 block"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const next = await updateCoverImage(file);
              setUser(next);
              toast.success('Saved');
            }}
          />
        </label>
      </section>
    );
  }

  if (tab === 'notifications') {
    return (
      <section>
        <h2 className="text-xl font-bold">Notifications</h2>
        <p className="mt-2 text-sm text-muted">Notifications coming soon. The bell is hidden from claiming unread counts until the backend ships this.</p>
      </section>
    );
  }

  if (tab === 'privacy') {
    return (
      <section>
        <h2 className="text-xl font-bold">Privacy</h2>
        <p className="mt-2 text-sm text-muted">Watch history and liked videos stay on this device when the backend is in demo mode.</p>
      </section>
    );
  }

  if (tab === 'playback') {
    return (
      <section>
        <h2 className="text-xl font-bold">Playback</h2>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
          Autoplay next video
        </label>
        <label className="mt-4 block text-sm">
          Quality
          <select className="mt-2 h-10 rounded-lg border border-border bg-surface px-3">
            <option>Auto (single MP4)</option>
          </select>
        </label>
        <Button className="mt-4" onClick={() => toast.success('Saved')}>
          Save
        </Button>
      </section>
    );
  }

  return (
    <section className="max-w-lg space-y-6">
      <h2 className="text-xl font-bold">Account</h2>
      <form
        className="space-y-4"
        onSubmit={profile.handleSubmit(async (values) => {
          const next = await updateAccount(values);
          setUser(next);
          toast.success('Saved');
        })}
      >
        <TextField label="Name" {...profile.register('fullName')} error={profile.formState.errors.fullName?.message} />
        <TextField label="Email" {...profile.register('email')} error={profile.formState.errors.email?.message} />
        <Button type="submit">Save</Button>
      </form>
      <form
        className="space-y-4"
        onSubmit={password.handleSubmit(async (values) => {
          await changePassword(values);
          toast.success('Password changed');
          password.reset();
        })}
      >
        <h3 className="font-semibold">Change password</h3>
        <TextField label="Current password" type="password" {...password.register('oldPassword')} error={password.formState.errors.oldPassword?.message} />
        <TextField label="New password" type="password" {...password.register('newPassword')} error={password.formState.errors.newPassword?.message} />
        <TextField label="Confirm" type="password" {...password.register('confirmPassword')} error={password.formState.errors.confirmPassword?.message} />
        <Button type="submit" variant="secondary">
          Update password
        </Button>
      </form>
    </section>
  );
}
