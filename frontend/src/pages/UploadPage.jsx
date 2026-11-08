import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { uploadSchema, validateImageFile, validateVideoFile } from '@/lib/validators';
import { CATEGORIES } from '@/lib/constants';
import { confirmDelete } from '@/lib/confirm';
import { uploadVideo } from '@/services/upload.service';
import FileDropzone from '@/components/forms/FileDropzone';
import TextField from '@/components/forms/TextField';
import TextAreaField from '@/components/forms/TextAreaField';
import SelectField from '@/components/forms/SelectField';
import Button from '@/components/ui/Button';
import { formatBytes } from '@/lib/format';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: '', description: '', category: '', visibility: 'public', tags: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const fileError = validateVideoFile(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }
    if (thumb) {
      const imageError = validateImageFile(thumb);
      if (imageError) {
        toast.error(imageError);
        return;
      }
    }
    setUploading(true);
    setProgress(0);
    const id = toast.loading('Uploading…');
    try {
      const video = await uploadVideo({
        file,
        thumbnail: thumb,
        title: values.title,
        description: values.description,
        onProgress: (pct) => {
          setProgress(pct);
          if (pct >= 100) {
            toast.loading('Processing video on server…', { id });
          }
        },
      });
      toast.success('Video published', { id });
      navigate(video?.id ? `/watch/${video.id}` : '/studio/videos');
    } catch (err) {
      toast.error(err.message || 'Upload failed — please try again', { id });
    } finally {
      setUploading(false);
    }
  });

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <h1 className="mb-6 text-2xl font-bold">Upload</h1>
      <FileDropzone file={file} onFile={setFile} accept="video/*" height="h-[180px] sm:h-[240px]" />
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <TextField label="Title" {...form.register('title')} error={form.formState.errors.title?.message} />
        <TextAreaField label="Description" {...form.register('description')} error={form.formState.errors.description?.message} />
        <SelectField label="Category" {...form.register('category')} error={form.formState.errors.category?.message}>
          <option value="">Choose a category</option>
          {CATEGORIES.filter((c) => c !== 'All').map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Visibility</legend>
          <div className="flex gap-4 text-sm">
            {['public', 'unlisted', 'private'].map((v) => (
              <label key={v} className="flex items-center gap-2 capitalize">
                <input type="radio" value={v} {...form.register('visibility')} />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
        <TextField label="Tags" placeholder="react, vite, javascript" {...form.register('tags')} />
        <label className="block text-sm font-medium">
          Thumbnail
          <input type="file" accept="image/*" className="mt-2 block text-sm" onChange={(e) => setThumb(e.target.files?.[0] || null)} />
        </label>
        {uploading ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {progress < 100
                ? `${progress}% ${file ? `• ${formatBytes(file.size)}` : ''}`
                : 'Processing video on server… Please wait'}
            </p>
          </div>
        ) : null}
        <div className="flex gap-2">
          <Button type="submit" loading={uploading}>
            Publish
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (await confirmDelete({ title: 'Discard this upload?', text: 'Unsaved details will be lost.', confirmButtonText: 'Discard' })) {
                navigate('/');
              }
            }}
          >
            Discard
          </Button>
        </div>
      </form>
    </div>
  );
}
