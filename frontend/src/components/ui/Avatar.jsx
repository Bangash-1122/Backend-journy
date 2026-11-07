import { initials } from '@/lib/format';

const sizes = { 24: 'size-6 text-[10px]', 32: 'size-8 text-xs', 36: 'size-9 text-xs', 48: 'size-12 text-sm', 64: 'size-16 text-lg', 80: 'size-20 text-xl' };

export default function Avatar({ src, name = '', size = 36, className = '' }) {
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-brand text-white grid place-items-center font-semibold ${className}`}>
      {initials(name)}
    </div>
  );
}
