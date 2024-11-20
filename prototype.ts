import { Client } from '@hubspot/api-client';
import fs from 'fs/promises';
import csv from 'csv-parser';
import { Readable } from 'stream';
import path from 'path';


// TypeScript interfaces for our data structures
interface LinkMapping {
  englishLink: string;
  quebecFrenchLink: string;
  domain: string;
}

interface LinkMapping {
  englishPattern: string;
  quebecFrenchReplacement: string;
  domain: string;
}

interface ImageMapping {
  originalPattern: string;
  localizedReplacement: string;
  metadata: Record<string, string>;
}

class TranslationAutomation {
  private hubspotClient: Client;
  private linkMappings: LinkMapping[] = [];
  private imageMappings: ImageMapping[] = [];

  constructor(hubspotApiKey: string) {
    this.hubspotClient = new Client({ accessToken: hubspotApiKey });
  }

  async loadLinkMappings(filePath: string): Promise<void> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    await new Promise<void>((resolve, reject) => {
      Readable.from(fileContent)
        .pipe(csv())
        .on('data', (row: LinkMapping) => {
          this.linkMappings.push(row);
        })
        .on('end', () => {
          console.log('Link mappings loaded successfully');
          resolve();
        })
        .on('error', reject);
    });
  }

  async loadImageMappings(filePath: string): Promise<void> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    await new Promise<void>((resolve, reject) => {
      Readable.from(fileContent)
        .pipe(csv())
        .on('data', (row: ImageMapping) => {
          this.imageMappings.push(row);
        })
        .on('end', () => {
          console.log('Image mappings loaded successfully');
          resolve();
        })
        .on('error', reject);
    });
  }

  async processPage(pageId: string): Promise<void> {
    try {
      // Fetch page content from HubSpot
      const page = await this.hubspotClient.cms.pages.basicApi.getById(pageId);
      let content = page.content;

      // Replace links and images
      content = this.replaceLinks(content);
      content = this.replaceImages(content);

      // Update page in HubSpot
      await this.hubspotClient.cms.pages.basicApi.update(pageId, { content });
      console.log(`Updated page: ${pageId}`);
    } catch (error) {
      console.error(`Error processing page ${pageId}:`, error);
    }
  }

  private replaceLinks(content: string): string {
    for (const mapping of this.linkMappings) {
      const regex = new RegExp(mapping.englishPattern, 'gi');
      content = content.replace(regex, (match) => {
        // Preserve the original casing
        const replacement = mapping.quebecFrenchReplacement;
        return match === match.toUpperCase() ? replacement.toUpperCase() : replacement;
      });
    }
    return content;
  }

  private replaceImages(content: string): string {
    for (const mapping of this.imageMappings) {
      const regex = new RegExp(mapping.originalPattern, 'gi');
      content = content.replace(regex, (match) => {
        // Check if the replacement is a full URL or just a filename
        const replacement = mapping.localizedReplacement.startsWith('http')
          ? mapping.localizedReplacement
          : path.join(path.dirname(match), mapping.localizedReplacement);
        return replacement;
      });
    }
    return content;
  }

  async run(pageIds: string[]): Promise<void> {
    for (const pageId of pageIds) {
      await this.processPage(pageId);
    }
  }
}

// Logging function for manual review
function logForReview(message: string): void {
  console.log(`[REVIEW NEEDED] ${message}`);
  // In a real-world scenario, you might want to write this to a file or send it to a logging service
}

// Main execution function
async function main() {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    if (!hubspotApiKey) {
      throw new Error('HUBSPOT_API_KEY environment variable is not set');
    }

    const automation = new TranslationAutomation(hubspotApiKey);

    // Load mappings
    await automation.loadLinkMappings('path/to/link_mappings.csv');
    await automation.loadImageMappings('path/to/image_mappings.csv');

    // Get list of pages to process
    // In a real-world scenario, you might fetch this list from HubSpot or read it from a file
    const pageIds = ['page-id-1', 'page-id-2', 'page-id-3'];

    // Run the automation
    await automation.run(pageIds);

    console.log('Translation automation completed successfully');
  } catch (error) {
    console.error('An error occurred during the automation process:', error);
    logForReview('The automation process encountered an error and did not complete successfully');
  }
}

// Run the main function
main().catch(console.error);