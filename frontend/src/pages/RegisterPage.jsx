import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema } from '@/lib/validators';
import { loginUser, registerUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import TextField from '@/components/forms/TextField';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerUser(values);
      const session = await loginUser({ email: values.email, password: values.password });
      login(session.user, session.token, session.refreshToken);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Could not register');
    }
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">▶</span>
        <span className="text-lg font-bold">VideoHub</span>
      </div>
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-muted">Join VideoHub with JavaScript, not TypeScript.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <TextField label="Name" {...form.register('fullName')} error={form.formState.errors.fullName?.message} />
        <TextField label="Username" {...form.register('username')} error={form.formState.errors.username?.message} />
        <TextField label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
        <TextField label="Password" type="password" {...form.register('password')} error={form.formState.errors.password?.message} />
        <TextField label="Confirm password" type="password" {...form.register('confirmPassword')} error={form.formState.errors.confirmPassword?.message} />
        <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
          Sign up
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-text">
          Sign in
        </Link>
      </p>
    </div>
  );
}
