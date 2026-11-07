import {
    lazy
} from 'react';

export const HomePage = lazy(() => import('@/pages/HomePage'));
export const WatchPage = lazy(() => import('@/pages/WatchPage'));
export const SearchPage = lazy(() => import('@/pages/SearchPage'));
export const ChannelPage = lazy(() => import('@/pages/ChannelPage'));
export const UploadPage = lazy(() => import('@/pages/UploadPage'));
export const PlaylistsPage = lazy(() => import('@/pages/PlaylistsPage'));
export const PlaylistDetailPage = lazy(() => import('@/pages/PlaylistDetailPage'));
export const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage'));
export const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
export const LoginPage = lazy(() => import('@/pages/LoginPage'));
export const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
export const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
export const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
export const StudioDashboard = lazy(() => import('@/pages/Studio/StudioDashboard'));
export const StudioVideos = lazy(() => import('@/pages/Studio/StudioVideos'));
export const StudioAnalytics = lazy(() => import('@/pages/Studio/StudioAnalytics'));
export const StudioVideoEdit = lazy(() => import('@/pages/Studio/StudioVideoEdit'));
export const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));