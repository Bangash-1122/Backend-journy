import { CATEGORIES } from '@/lib/constants';
import Chip from '@/components/ui/Chip';

export default function CategoryChips({ value, onChange }) {
  return (
    <div className="sticky top-14 z-20 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-bg px-4 py-3 scrollbar-hide md:-mx-6 md:px-6">
      {CATEGORIES.map((cat) => (
        <Chip key={cat} active={value === cat} onClick={() => onChange(cat)}>
          {cat}
        </Chip>
      ))}
    </div>
  );
}
