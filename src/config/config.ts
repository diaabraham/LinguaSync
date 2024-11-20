// config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY,
  linkMappingsPath: process.env.LINK_MAPPINGS_PATH || 'path/to/link_mappings.csv',
  imageMappingsPath: process.env.IMAGE_MAPPINGS_PATH || 'path/to/image_mappings.csv',
  logFilePath: process.env.LOG_FILE_PATH || 'translation_automation.log',
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
};

// main.ts
import { config } from './config';
import { TranslationAutomation } from './TranslationAutomation';

async function main() {
  try {
    if (!config.hubspotApiKey) {
      throw new Error('HUBSPOT_API_KEY environment variable is not set');
    }

    const automation = new TranslationAutomation(config.hubspotApiKey);

    await automation.loadLinkMappings(config.linkMappingsPath);
    await automation.loadImageMappings(config.imageMappingsPath);

    // Get list of pages to process (you might want to implement this method)
    const pageIds = await automation.getPageIds();

    // Process pages in batches
    for (let i = 0; i < pageIds.length; i += config.batchSize) {
      const batch = pageIds.slice(i, i + config.batchSize);
      await automation.run(batch);
    }

    console.log('Translation automation completed successfully');
  } catch (error) {
    console.error('An error occurred during the automation process:', error);
    logForReview('The automation process encountered an error and did not complete successfully');
  }
}

main().catch(console.error);