import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import StudioLayout from '@/layouts/StudioLayout';
import SettingsLayout from '@/layouts/SettingsLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import {
    HomePage,
    WatchPage,
    SearchPage,
    ChannelPage,
    UploadPage,
    PlaylistsPage,
    PlaylistDetailPage,
    SubscriptionsPage,
    LibraryPage,
    LoginPage,
    RegisterPage,
    ProfilePage,
    SettingsPage,
    StudioDashboard,
    StudioVideos,
    StudioAnalytics,
    StudioVideoEdit,
    NotFoundPage,
} from './lazy';

export const routes = [{
        element: < MainLayout / > ,
        children: [{
                path: '/',
                element: < HomePage / >
            },
            {
                path: '/watch/:videoId',
                element: < WatchPage / >
            },
            {
                path: '/search',
                element: < SearchPage / >
            },
            {
                path: '/channel/:channelId',
                element: < ChannelPage / >
            },
            {
                path: '/upload',
                element: ( <
                    ProtectedRoute >
                    <
                    UploadPage / >
                    <
                    /ProtectedRoute>
                ),
            },
            {
                path: '/playlists',
                element: ( <
                    ProtectedRoute >
                    <
                    PlaylistsPage / >
                    <
                    /ProtectedRoute>
                ),
            },
            {
                path: '/playlist/:playlistId',
                element: < PlaylistDetailPage / >
            },
            {
                path: '/subscriptions',
                element: ( <
                    ProtectedRoute >
                    <
                    SubscriptionsPage / >
                    <
                    /ProtectedRoute>
                ),
            },
            {
                path: '/library',
                element: ( <
                    ProtectedRoute >
                    <
                    LibraryPage / >
                    <
                    /ProtectedRoute>
                ),
            },
            {
                element: ( <
                    ProtectedRoute >
                    <
                    SettingsLayout / >
                    <
                    /ProtectedRoute>
                ),
                children: [{
                        path: '/profile',
                        element: < ProfilePage / >
                    },
                    {
                        path: '/settings',
                        element: < SettingsPage / >
                    },
                ],
            },
            {
                path: '*',
                element: < NotFoundPage / >
            },
        ],
    },
    {
        element: < AuthLayout / > ,
        children: [{
                path: '/login',
                element: ( <
                    PublicRoute >
                    <
                    LoginPage / >
                    <
                    /PublicRoute>
                ),
            },
            {
                path: '/register',
                element: ( <
                    PublicRoute >
                    <
                    RegisterPage / >
                    <
                    /PublicRoute>
                ),
            },
        ],
    },
    {
        element: ( <
            ProtectedRoute >
            <
            StudioLayout / >
            <
            /ProtectedRoute>
        ),
        children: [{
                path: '/studio',
                element: < StudioDashboard / >
            },
            {
                path: '/studio/videos',
                element: < StudioVideos / >
            },
            {
                path: '/studio/videos/:videoId',
                element: < StudioVideoEdit / >
            },
            {
                path: '/studio/analytics',
                element: < StudioAnalytics / >
            },
        ],
    },
];