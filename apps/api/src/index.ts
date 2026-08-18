import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to extract Channel ID from URL
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

    // Access the key directly at runtime when the request is made
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('[API Error] YOUTUBE_API_KEY is not defined in .env');
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    console.log(`[API] Fetching data for channel ID: ${channelId}`);

    // Call YouTube Data API v3
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
    const response = await fetch(apiUrl);

    const data = await response.json();

    // Check if Google returned an API error (e.g., API Key invalid, quota exceeded, or service disabled)
    if (data.error) {
      console.error('[YouTube API Error Details]:', data.error);
      return res.status(400).json({ error: `YouTube API Error: ${data.error.message}` });
    }

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