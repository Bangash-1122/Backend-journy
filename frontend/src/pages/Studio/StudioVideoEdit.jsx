import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useVideo, useUpdateVideo } from '@/hooks/useVideos';
import TextField from '@/components/forms/TextField';
import TextAreaField from '@/components/forms/TextAreaField';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/feedback/ErrorState';
import Skeleton from '@/components/ui/Skeleton';

export default function StudioVideoEdit() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const query = useVideo(videoId);
  const update = useUpdateVideo();
  const video = query.data;
  const form = useForm({
    values: { title: video?.title || '', description: video?.description || '' },
  });

  if (query.isLoading) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Edit video</h1>
      <img src={video.thumbnail} alt="" className="mt-4 aspect-video w-full rounded-xl object-cover" />
      <form
        className="mt-4 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await update.mutateAsync({ id: videoId, payload: values });
          toast.success('Saved');
          navigate('/studio/videos');
        })}
      >
        <TextField label="Title" {...form.register('title')} />
        <TextAreaField label="Description" {...form.register('description')} />
        <Button type="submit" loading={update.isPending}>
          Save
        </Button>
      </form>
    </div>
  );
}
