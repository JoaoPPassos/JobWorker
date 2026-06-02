import { Module } from '@nestjs/common';
import { JobEnrichmentsConsumerService } from './services/JobEnrichmentsConsumer.services';
import { JobEnrichmentsConsumer } from './controller/JobEnrichmentsConsumer.controller';
import { RabbitmqModule } from '@infrastructure/messaging/rabbitmq.module';
import { LinkedinUseCase } from './use-cases/linkedin-use-case.use-case';
import { LinkedinProcessor } from './repository/linkedinProcessor.repository';
import { JobsApiClient } from '@infrastructure/http/jobs-api.client';
import { EnrichmentUseCaseFactory } from './factories/enrichment-use-case.factory';
import { LINKEDIN_PROCESSOR_TOKEN } from '@domain/port/IJobEnrichment.port';

@Module({
  imports: [RabbitmqModule],
  providers: [
    JobEnrichmentsConsumerService,
    JobEnrichmentsConsumer,
    EnrichmentUseCaseFactory,
    LinkedinUseCase,
    { provide: LINKEDIN_PROCESSOR_TOKEN, useClass: LinkedinProcessor },
    JobsApiClient,
  ],
})
export class JobEnrichmentsConsumerModule {}
