import type {
  IJobEnrichmentProcessor,
  JobDataProcessed,
} from '@domain/port/IJobEnrichment.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkedinUseCase {
  constructor(private linkedinProcessor: IJobEnrichmentProcessor) {}

  async execute(sourceUrl: string): Promise<JobDataProcessed> {
    return await this.linkedinProcessor.processContent(sourceUrl);
  }
}
