import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { JobEnrichmentsConsumerService } from '../services/JobEnrichmentsConsumer.services';

@Injectable()
export class JobEnrichmentsConsumer {
  constructor(private jobEnrichmentService: JobEnrichmentsConsumerService) {}

  @RabbitSubscribe({
    exchange: 'jobs',
    routingKey: 'jobs.enrich',
    queue: 'job.enrich',
  })
  async handleEnrichment(msg: {
    jobId: string;
    sourceUrl: string;
    sourcePlatform: string;
  }): Promise<void> {
    await this.jobEnrichmentService.process(msg);
  }
}
