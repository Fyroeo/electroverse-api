import { PlaywrightElectroverseClient } from '../src/index';
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import * as fs from 'fs';

async function main() {
  const client = new PlaywrightElectroverseClient();
  
  try {
    console.log("Initializing stealth browser...");
    await client.init(true);

    const url = 'https://electroverse.com/api/proxy/rest/locations/tiles/elastic/4/8/5?exclude_non_ejn_locations=false';
    console.log(`Fetching tile from: ${url}`);
    
    const base64Data = await client['page']!.evaluate(async (tileUrl) => {
      const response = await fetch(tileUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const buffer = await response.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, url);

    console.log("Tile downloaded! Decoding Protobuf/MVT...");
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    const pbf = new Pbf(buffer);
    const tile = new VectorTile(pbf);
    
    console.log(`\nFound ${Object.keys(tile.layers).length} layers in the tile.`);
    
    const stations: any[] = [];

    for (const layerName in tile.layers) {
      const layer = tile.layers[layerName];
      console.log(`Layer: '${layerName}' has ${layer.length} features (stations).`);
      
      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        
        stations.push({
          id: feature.id,
          properties: feature.properties,
          type: feature.type // 1 = Point
        });
      }
    }

    console.log(`\nSuccessfully decoded ${stations.length} stations!`);
    
    fs.writeFileSync('decoded-stations.json', JSON.stringify(stations, null, 2));
    console.log("Saved raw station data to 'decoded-stations.json'");
    
    if (stations.length > 0) {
      console.log("\nPreview of first station properties:");
      console.log(stations[0].properties);
    }

  } catch (error) {
    console.error("Error fetching or decoding tile:", error);
  } finally {
    await client.close();
  }
}

main();
