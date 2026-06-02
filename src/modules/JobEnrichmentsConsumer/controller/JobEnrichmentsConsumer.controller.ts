import {
  MessageHandlerErrorBehavior,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { JobEnrichmentsConsumerService } from '../services/JobEnrichmentsConsumer.services';

@Injectable()
export class JobEnrichmentsConsumer {
  private readonly logger = new Logger(JobEnrichmentsConsumer.name);

  constructor(private jobEnrichmentService: JobEnrichmentsConsumerService) {}

  @RabbitSubscribe({
    exchange: 'jobs',
    routingKey: 'job.enrich',
    queue: 'job.enrich',
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async handleEnrichment(msg: {
    jobId: string;
    sourceUrl: string;
    sourcePlatform: string;
  }): Promise<void> {
    this.logger.log(`Received message: ${JSON.stringify(msg)}`);
    await this.jobEnrichmentService.process(msg);
  }
}
