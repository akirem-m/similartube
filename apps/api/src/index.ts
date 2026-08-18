import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to extract Channel ID from URL
// For Day 1, we only support URLs like https://www.youtube.com/channel/UCxxxxxx
function extractChannelId(url: string): string | null {
  const match = url.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// POST /channel - Accepts { url: "..." } and returns real YT data
app.post('/channel', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const channelId = extractChannelId(url);
    if (!channelId) {
      return res.status(400).json({ error: 'Invalid YouTube Channel URL. Must be format: youtube.com/channel/UC...' });
    }

    console.log(`[API] Fetching data for channel ID: ${channelId}`);

    // Call YouTube Data API v3
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = data.items[0];

    // Normalize the response
    const normalizedData = {
      title: channel.snippet.title,
      description: channel.snippet.description,
      subscriberCount: channel.statistics.subscriberCount,
      viewCount: channel.statistics.viewCount,
      videoCount: channel.statistics.videoCount,
      thumbnail: channel.snippet.thumbnails.default.url
    };

    res.json(normalizedData);
  } catch (error: any) {
    console.error('[API Error]', error.message);
    res.status(500).json({ error: 'Failed to fetch channel data' });
  }
});

app.listen(port, () => {
  console.log(`[Server] SimilarTube API is running at http://localhost:${port}`);
});