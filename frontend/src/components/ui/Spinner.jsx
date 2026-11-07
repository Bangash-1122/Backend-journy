export default function Spinner({ className = 'size-8' }) {
  return <div className={`${className} rounded-full border-2 border-border border-t-brand animate-spin`} />;
}
