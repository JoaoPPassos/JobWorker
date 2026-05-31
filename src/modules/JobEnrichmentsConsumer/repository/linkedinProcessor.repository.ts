import { IJobEnrichmentProcessor } from '@domain/port/IJobEnrichment.port';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { mapLinkedinToJobData } from '../mappers/linkedin.mapper';
import { LinkedinApiResponse } from '../types/linkedin-api-response.type';

@Injectable()
export class LinkedinProcessor implements IJobEnrichmentProcessor {
  private readonly logger = new Logger(LinkedinProcessor.name);
  private readonly url = 'https://jobs-api14.p.rapidapi.com/v2/linkedin/get';
  constructor() {}

  async processContent(sourceUrl: string) {
    const url = new URL(sourceUrl);
    const match = url.pathname.match(/\/jobs\/view\/(\d+)/);
    const jobId = url.searchParams.get('currentJobId') || match?.[1];

    if (!jobId) throw new BadRequestException('Invalid source_url');

    const response = await fetch(`${this.url}?id=${jobId}`, {
      headers: {
        'x-rapidapi-host': 'jobs-api14.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? '',
      },
    });

    if (!response.ok) {
      this.logger.error(
        `LinkedIn API error ${response.status} for job ${jobId}`,
      );
      throw new BadRequestException(
        `Failed to fetch job details for id ${jobId}`,
      );
    }

    const body = (await response.json()) as LinkedinApiResponse;

    return mapLinkedinToJobData(body.data);
  }
}
