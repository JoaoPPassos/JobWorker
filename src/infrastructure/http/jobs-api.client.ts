import { JobDataProcessed } from '@domain/port/IJobEnrichment.port';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobsApiClient {
  private readonly logger = new Logger(JobsApiClient.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.getOrThrow<string>('JOB_HUB_SERVICE_URL');
  }

  async updateJobMetadata(
    jobId: string,
    data: JobDataProcessed,
  ): Promise<void> {
    const url = `${this.baseUrl}/jobs/${jobId}/metadata`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to update job metadata for ${jobId}: ${response.status}`,
      );
      throw new Error(`Jobs API error ${response.status} for job ${jobId}`);
    }
  }
}
