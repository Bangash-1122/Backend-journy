import { timeAgo } from '@/lib/format';
import Avatar from '@/components/ui/Avatar';
import { ThumbsUp, Trash2 } from 'lucide-react';

export default function CommentItem({ comment, canDelete, onDelete }) {
  return (
    <div className="flex gap-3 py-3">
      <Avatar src={comment.owner?.avatar} name={comment.owner?.fullName} size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{comment.owner?.fullName || comment.owner?.username}</span>
          <span className="ml-2 text-xs text-muted">{timeAgo(comment.createdAt)}</span>
        </p>
        <p className="mt-1 text-sm leading-5">{comment.text}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <button className="inline-flex items-center gap-1" type="button">
            <ThumbsUp size={14} /> {comment.likes || 0}
          </button>
          <button type="button">Reply</button>
          {canDelete ? (
            <button type="button" onClick={() => onDelete(comment.id)} className="inline-flex items-center gap-1 text-danger">
              <Trash2 size={14} /> Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
