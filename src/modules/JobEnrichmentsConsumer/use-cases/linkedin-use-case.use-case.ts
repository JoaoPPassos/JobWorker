import { Inject, Injectable } from '@nestjs/common';
import { LINKEDIN_PROCESSOR_TOKEN } from '@domain/port/IJobEnrichment.port';
import type {
  IEnrichmentUseCase,
  IJobEnrichmentProcessor,
  JobDataProcessed,
} from '@domain/port/IJobEnrichment.port';

@Injectable()
export class LinkedinUseCase implements IEnrichmentUseCase {
  constructor(
    @Inject(LINKEDIN_PROCESSOR_TOKEN)
    private linkedinProcessor: IJobEnrichmentProcessor,
  ) {}

  async execute(sourceUrl: string): Promise<JobDataProcessed> {
    return this.linkedinProcessor.processContent(sourceUrl);
  }
}
