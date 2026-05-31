import { JobDataProcessed } from '@domain/port/IJobEnrichment.port';
import { LinkedinApiResponseData } from '../types/linkedin-api-response.type';

export function mapLinkedinToJobData(
  data: LinkedinApiResponseData,
): JobDataProcessed {
  return {
    title: data.title,
    company: data.companyName,
    description: data.description,
    salary_range: '',
    location: data.location,
  };
}
