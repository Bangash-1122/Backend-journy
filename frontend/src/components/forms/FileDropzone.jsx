import { useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { formatBytes } from '@/lib/format';

export default function FileDropzone({ accept, onFile, file, hint = 'Drag and drop or Select Video', height = 'h-[240px]' }) {
  const [over, setOver] = useState(false);

  const take = (list) => {
    const next = list?.[0];
    if (next) onFile(next);
  };

  return (
    <label
      className={`flex ${height} cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed ${
        over ? 'border-brand bg-brand-soft' : 'border-border bg-surface'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
    >
      <CloudUpload className="text-muted" size={40} />
      <p className="mt-3 text-sm font-semibold">{file ? file.name : hint}</p>
      <p className="mt-1 text-xs text-muted">{file ? formatBytes(file.size) : 'MP4, WebM, MOV'}</p>
      <input type="file" accept={accept} className="sr-only" onChange={(e) => take(e.target.files)} />
    </label>
  );
}
