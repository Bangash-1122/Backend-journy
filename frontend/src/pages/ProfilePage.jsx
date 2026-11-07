import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6 flex items-center gap-4">
        <Avatar src={user.avatar} name={user.fullName} size={80} />
        <div>
          <p className="text-xl font-semibold">{user.fullName}</p>
          <p className="text-sm text-muted">@{user.username}</p>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
      </div>
      <Link to="/settings" className="mt-6 inline-block">
        <Button>Edit settings</Button>
      </Link>
    </div>
  );
}
