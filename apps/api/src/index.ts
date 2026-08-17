import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes (essential for Chrome Extension dev)
app.use(express.json());

// Dummy route for testing the vertical slice
app.get('/channel', (req: Request, res: Response) => {
  console.log('Received request for channel');
  
  // Hardcoded dummy data for now
  const dummyChannelData = {
    title: "Dummy Channel",
    description: "This is a test response from the backend.",
    subscriberCount: "10000",
    viewCount: "500000",
    videoCount: "50"
  };

  res.json(dummyChannelData);
});

app.listen(port, () => {
  console.log(`[Server] SimilarTube API is running at http://localhost:${port}`);
});
app.get('/', (req: Request, res: Response) => {
  res.send('SimilarTube API is active!');
});