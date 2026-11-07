import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema } from '@/lib/validators';
import { loginUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import TextField from '@/components/forms/TextField';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [show, setShow] = useState(false);
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: 'demo@videohub.app', password: 'demo1234', remember: true } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await loginUser({ email: values.email, password: values.password });
      login(result.user, result.token, result.refreshToken);
      toast.success('Signed in');
      navigate(params.get('redirect') || '/');
    } catch (err) {
      toast.error(err.message || 'Could not sign in');
    }
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">▶</span>
        <span className="text-lg font-bold">VideoHub</span>
      </div>
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Welcome back — pick up where you left off.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <TextField label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
        <div className="relative">
          <TextField label="Password" type={show ? 'text' : 'password'} {...form.register('password')} error={form.formState.errors.password?.message} />
          <button type="button" className="absolute right-3 top-9 text-xs text-muted" onClick={() => setShow((v) => !v)}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Don’t have an account?{' '}
        <Link to="/register" className="font-semibold text-text">
          Sign up
        </Link>
      </p>
    </div>
  );
}
