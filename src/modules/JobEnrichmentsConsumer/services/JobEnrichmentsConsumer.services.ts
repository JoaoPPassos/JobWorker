import { Injectable } from '@nestjs/common';
import { source_type } from '@shared/enums/source.enum';
import { LinkedinUseCase } from '../use-cases/linkedin-use-case.use-case';
import { JobDataProcessed } from '@domain/port/IJobEnrichment.port';
import { JobsApiClient } from '@infrastructure/http/jobs-api.client';

@Injectable()
export class JobEnrichmentsConsumerService {
  constructor(
    private likedinUseCase: LinkedinUseCase,
    private jobsApiClient: JobsApiClient,
  ) {}

  async process(msg: {
    jobId: string;
    sourceUrl: string;
    sourcePlatform: string;
  }) {
    let data: JobDataProcessed | undefined;

    if (msg.sourcePlatform === source_type.linkedin) {
      data = await this.likedinUseCase.execute(msg.sourceUrl);
    }

    if (data) {
      await this.jobsApiClient.updateJobMetadata(msg.jobId, data);
    }
  }
}
