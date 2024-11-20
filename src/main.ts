// src/main.ts

import { config } from './config/config';
import { TranslationAutomation } from './services/TranslationAutomation';
import { logger } from './utils/logger';

async function main() {
  try {
    if (!config.hubspotApiKey) {
      throw new Error('HUBSPOT_API_KEY environment variable is not set');
    }

    const automation = new TranslationAutomation(config.hubspotApiKey);

    await automation.loadLinkMappings(config.linkMappingsPath);
    await automation.loadImageMappings(config.imageMappingsPath);

    const pageIds = await automation.getPageIds();

    // Process pages in batches
    for (let i = 0; i < pageIds.length; i += config.batchSize) {
      const batch = pageIds.slice(i, i + config.batchSize);
      await automation.run(batch);
    }

    logger.info('Translation automation completed successfully');
  } catch (error) {
    logger.error('An error occurred during the automation process:', error);
  }
}

main().catch(console.error);