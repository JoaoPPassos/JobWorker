import { IJobEnrichmentProcessor } from '@domain/port/IJobEnrichment.port';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mapLinkedinToJobData } from '../mappers/linkedin.mapper';
import { LinkedinApiResponse } from '../types/linkedin-api-response.type';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 5000;

@Injectable()
export class LinkedinProcessor implements IJobEnrichmentProcessor {
  private readonly logger = new Logger(LinkedinProcessor.name);
  private readonly apiUrl = 'https://jobs-api14.p.rapidapi.com/v2/linkedin/get';
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('RAPIDAPI_KEY');
  }

  async processContent(sourceUrl: string) {
    const url = new URL(sourceUrl);
    const match = url.pathname.match(/\/jobs\/view\/(\d+)/);
    const jobId = url.searchParams.get('currentJobId') || match?.[1];

    if (!jobId) throw new BadRequestException('Invalid source_url');

    let lastStatus = 0;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const requestUrl = `${this.apiUrl}?id=${jobId}`;
      this.logger.log(
        `Calling LinkedIn API: GET ${requestUrl} (attempt ${attempt}/${MAX_RETRIES})`,
      );
      const response = await fetch(requestUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'jobs-api14.p.rapidapi.com',
          'x-rapidapi-key': this.apiKey,
        },
      });

      if (response.ok) {
        const body = (await response.json()) as LinkedinApiResponse;
        return mapLinkedinToJobData(body.data);
      }

      lastStatus = response.status;

      if (response.status === 429 && attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * 2 ** (attempt - 1);
        this.logger.warn(
          `Rate limited (429) for job ${jobId}. Retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      this.logger.error(
        `LinkedIn API error ${response.status} for job ${jobId}`,
      );
      throw new BadRequestException(
        `Failed to fetch job details for id ${jobId}`,
      );
    }

    throw new BadRequestException(
      `Rate limit exceeded after ${MAX_RETRIES} attempts for job ${jobId} (status ${lastStatus})`,
    );
  }
}
