export const LINKEDIN_PROCESSOR_TOKEN = 'IJobEnrichmentProcessor';

export interface IJobEnrichmentProcessor {
  processContent: (sourceUrl: string) => Promise<JobDataProcessed>;
}

export interface IEnrichmentUseCase {
  execute: (sourceUrl: string) => Promise<JobDataProcessed>;
}

export type JobDataProcessed = {
  title: string;
  company: string;
  description: string;
  location: string;
};
