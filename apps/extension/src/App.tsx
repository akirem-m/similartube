import { useState } from 'react';

interface ChannelData {
  title: string;
  description: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

function App() {
  const [channelUrl, setChannelUrl] = useState('');
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchChannel = async () => {
    setLoading(true);
    setError(null);
    setChannelData(null);

    try {
      // We are hitting the dummy backend route for now
      const response = await fetch(`http://localhost:3000/channel?url=${encodeURIComponent(channelUrl)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setChannelData(data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '320px', padding: '16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>SimilarTube</h1>
      
      <input
        type="text"
        placeholder="Enter YouTube Channel URL"
        value={channelUrl}
        onChange={(e) => setChannelUrl(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
      />
      
      <button
        onClick={handleFetchChannel}
        disabled={loading || !channelUrl.trim()}
        style={{ width: '100%', padding: '8px', cursor: 'pointer', background: '#ff0000', color: 'white', border: 'none', borderRadius: '4px', opacity: (loading || !channelUrl.trim()) ? 0.6 : 1 }}
      >
        {loading ? 'Fetching...' : 'Find Channel Info'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '8px' }}>Error: {error}</p>}

      {channelData && (
        <div style={{ marginTop: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>{channelData.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', margin: '0 0 8px 0' }}>{channelData.description}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span>Subs: {channelData.subscriberCount}</span>
            <span>Views: {channelData.viewCount}</span>
            <span>Vids: {channelData.videoCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;