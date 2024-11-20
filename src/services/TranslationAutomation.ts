// src/services/TranslationAutomation.ts

import { Client } from '@hubspot/api-client';
import fs from 'fs/promises';
import csv from 'csv-parser';
import { Readable } from 'stream';
import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config/config';

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

export class TranslationAutomation {
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
          logger.info('Link mappings loaded successfully');
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
          logger.info('Image mappings loaded successfully');
          resolve();
        })
        .on('error', reject);
    });
  }

  async processPage(pageId: string): Promise<void> {
    try {
      logger.info(`Starting to process page: ${pageId}`);
      const page = await this.hubspotClient.cms.pages.basicApi.getById(pageId);
      let content = page.content;

      const originalLinkCount = (content.match(/href/g) || []).length;
      const originalImageCount = (content.match(/<img/g) || []).length;

      content = this.replaceLinks(content);
      content = this.replaceImages(content);

      const updatedLinkCount = (content.match(/href/g) || []).length;
      const updatedImageCount = (content.match(/<img/g) || []).length;

      await this.hubspotClient.cms.pages.basicApi.update(pageId, { content });

      logger.info(`Processed page: ${pageId}`, {
        originalLinkCount,
        updatedLinkCount,
        originalImageCount,
        updatedImageCount,
        linksReplaced: originalLinkCount - updatedLinkCount,
        imagesReplaced: originalImageCount - updatedImageCount,
      });
    } catch (error) {
      logger.error(`Error processing page ${pageId}:`, error);
    }
  }

  private replaceLinks(content: string): string {
    for (const mapping of this.linkMappings) {
      const regex = new RegExp(mapping.englishPattern, 'gi');
      content = content.replace(regex, (match) => {
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

  async getPageIds(): Promise<string[]> {
    // This method should be implemented to fetch page IDs from HubSpot
    // For now, we'll return a placeholder array
    return ['page-id-1', 'page-id-2', 'page-id-3'];
  }
}