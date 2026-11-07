import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, onSubmit, placeholder = 'Search for videos, channels, playlists…', className = '' }) {
  return (
    <form
      className={`flex h-10 max-w-[560px] w-full overflow-hidden rounded-full border border-border bg-bg ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
        aria-label="Search"
      />
      <button type="submit" className="w-14 grid place-items-center border-l border-border hover:bg-surface" aria-label="Search">
        <Search size={18} />
      </button>
    </form>
  );
}
