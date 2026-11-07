import {
    describe,
    it,
    expect
} from 'vitest';
import {
    render,
    screen
} from '@testing-library/react';
import {
    BrowserRouter
} from 'react-router-dom';
import {
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import VideoCard from '@/components/video/VideoCard';
import {
    makeVideo
} from '../factories';

const queryClient = new QueryClient();

function renderWithProviders(ui) {
    return render( <
        QueryClientProvider client = {
            queryClient
        } >
        <
        BrowserRouter > {
            ui
        } < /BrowserRouter> <
        /QueryClientProvider>,
    );
}

describe('UI components', () => {
            it('renders Button correctly and handles loading state', () => {
                        const {
                            rerender
                        } = render( < Button > Click me < /Button>);
                            expect(screen.getByRole('button', {
                                name: /click me/i
                            })).toBeInTheDocument();

                            rerender( < Button loading > Click me < /Button>);
                                expect(screen.getByRole('button')).toBeDisabled(); expect(screen.getByText(/loading/i)).toBeInTheDocument();
                            });

                        it('renders Chip with active state', () => {
                                    const {
                                        rerender
                                    } = render( < Chip > Gaming < /Chip>);
                                        expect(screen.getByRole('button', {
                                            name: /gaming/i
                                        })).toBeInTheDocument();

                                        rerender( < Chip active > Gaming < /Chip>);
                                            expect(screen.getByRole('button', {
                                                name: /gaming/i
                                            })).toHaveClass('font-semibold');
                                        });

                                    it('renders VideoCard with metadata', () => {
                                            const video = makeVideo({
                                                title: 'Special Test Video',
                                                views: 2400
                                            });
                                            renderWithProviders( < VideoCard video = {
                                                    video
                                                }
                                                />);
                                                expect(screen.getByText('Special Test Video')).toBeInTheDocument(); expect(screen.getByText(/2.4K views/i)).toBeInTheDocument(); expect(screen.getByRole('img', {
                                                    name: /thumbnail for special test video/i
                                                })).toBeInTheDocument();
                                            });
                                    });