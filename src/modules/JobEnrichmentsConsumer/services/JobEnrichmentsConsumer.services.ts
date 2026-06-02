import { Injectable } from '@nestjs/common';
import { JobsApiClient } from '@infrastructure/http/jobs-api.client';
import { EnrichmentUseCaseFactory } from '../factories/enrichment-use-case.factory';

@Injectable()
export class JobEnrichmentsConsumerService {
  constructor(
    private useCaseFactory: EnrichmentUseCaseFactory,
    private jobsApiClient: JobsApiClient,
  ) {}

  async process(msg: {
    jobId: string;
    sourceUrl: string;
    sourcePlatform: string;
  }) {
    const useCase = this.useCaseFactory.getUseCase(msg.sourcePlatform);

    if (!useCase) return;

    const data = await useCase.execute(msg.sourceUrl);
    await this.jobsApiClient.updateJobMetadata(msg.jobId, data);
  }
}
