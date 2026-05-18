import express from 'express';
import cors from 'cors';
import path from 'path';
import { PlaywrightElectroverseClient } from '../src/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new PlaywrightElectroverseClient();

app.get('/api/tiles/:z/:x/:y', async (req, res) => {
  const { z, x, y } = req.params;
  const tileUrl = `https://electroverse.com/api/proxy/rest/locations/tiles/elastic/${z}/${x}/${y}?exclude_non_ejn_locations=false`;

  try {
    const base64Data = await client['page']!.evaluate(async (url) => {
      const response = await fetch(url);
      if (!response.ok) return null;

      const buffer = await response.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, tileUrl);

    if (!base64Data) {
      return res.status(404).send('Tile not found');
    }

    const buffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', 'application/x-protobuf');
    res.send(buffer);
  } catch (error) {
    console.error(`Error fetching tile ${z}/${x}/${y}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/graphql', async (req, res) => {
  try {
    const { query, variables } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const result = await client.rawRequest(query, variables);
    res.json(result);
  } catch (error: any) {
    console.error("GraphQL Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, async () => {
  await client.init(true);
  console.log(`Server running on port ${PORT}`);
});
