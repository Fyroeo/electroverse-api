import { PlaywrightElectroverseClient } from '../src/index';

async function main() {
  const client = new PlaywrightElectroverseClient();
  
  try {
    console.log("Initializing stealth browser...");
    await client.init(false);

    console.log("\nFetching charging location details for PK 1109280...");
    const location = await client.getChargingLocation('1109280');
    console.log("Location Name:", location?.name);
    console.log("Location City:", location?.city);
    console.log("Location Operator:", location?.operator?.name);

    if (location?.evses?.edges?.length) {
      console.log(`Found ${location.evses.totalCount} EVSEs`);
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    console.log("Closing browser...");
    await client.close();
  }
}

main();
