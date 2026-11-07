import { z } from 'zod';
import { env } from './env';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password needs at least 6 characters'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name needs at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username needs 3–20 characters')
      .max(20, 'Username needs 3–20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscore only'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password needs at least 8 characters')
      .regex(/\d/, 'Password needs at least 1 number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const uploadSchema = z.object({
  title: z.string().min(3, 'Title needs at least 3 characters').max(100),
  description: z.string().max(5000).optional(),
  category: z.string().min(1, 'Choose a category'),
  visibility: z.enum(['public', 'unlisted', 'private']),
  tags: z.string().optional(),
});

export const playlistSchema = z.object({
  name: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(5000).optional(),
  visibility: z.enum(['public', 'unlisted', 'private']).optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(1000, 'Keep comments under 1000 characters'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name needs at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});

export const channelSchema = z.object({
  fullName: z.string().min(2, 'Channel name is required'),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscore only'),
  description: z.string().max(1000).optional(),
});

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'New password needs at least 8 characters').regex(/\d/, 'Needs 1 number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function validateVideoFile(file) {
  if (!file) return 'Select a video file';
  if (!file.type.startsWith('video/')) return 'File must be a video';
  if (file.size > env.uploadMaxMb * 1024 * 1024) return `File must be under ${env.uploadMaxMb} MB`;
  return null;
}

export function validateImageFile(file) {
  if (!file) return 'Select an image';
  if (!file.type.startsWith('image/')) return 'File must be an image';
  if (file.size > 10 * 1024 * 1024) return 'Image must be under 10 MB';
  return null;
}
