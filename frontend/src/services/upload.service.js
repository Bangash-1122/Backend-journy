import { mapVideo, unwrapBody } from '@/lib/adapters';
import { getToken } from '@/store/authStore';
import { env } from '@/lib/env';
import { uploadClient } from './api';

export function uploadVideo({ file, thumbnail, title, description, category, isShort, onProgress, signal }) {
  const form = new FormData();
  form.append('videoFile', file);
  if (thumbnail) form.append('thumbnail', thumbnail);
  form.append('title', title);
  form.append('description', description);
  if (category) form.append('category', category);
  if (isShort !== undefined) form.append('isShort', String(isShort));

  return uploadClient
    .post('/videos', form, {
      signal,
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : undefined },
      onUploadProgress: (evt) => {
        if (!onProgress || !evt.total) return;
        onProgress(Math.round((evt.loaded / evt.total) * 100), evt.loaded, evt.total);
      },
    })
    .then((res) => mapVideo(unwrapBody(res.data).data));
}

export { env };
