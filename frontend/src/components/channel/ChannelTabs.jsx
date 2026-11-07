import Tabs from '@/components/ui/Tabs';

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'videos', label: 'Videos' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'community', label: 'Community' },
  { id: 'about', label: 'About' },
];

export default function ChannelTabs({ value, onChange }) {
  return <Tabs tabs={tabs} value={value} onChange={onChange} />;
}
