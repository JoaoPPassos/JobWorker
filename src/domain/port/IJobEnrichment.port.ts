export interface IJobEnrichmentProcessor {
  processContent: (sourceUrl: string) => Promise<JobDataProcessed>;
}

export type JobDataProcessed = {
  title: string;
  company: string;
  description: string;
  salary_range: string;
  location: string;
};
