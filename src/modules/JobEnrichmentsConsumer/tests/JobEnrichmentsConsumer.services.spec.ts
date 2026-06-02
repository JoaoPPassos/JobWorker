import { JobEnrichmentsConsumerService } from '../services/JobEnrichmentsConsumer.services';
import { EnrichmentUseCaseFactory } from '../factories/enrichment-use-case.factory';
import { JobsApiClient } from '@infrastructure/http/jobs-api.client';
import {
  IEnrichmentUseCase,
  JobDataProcessed,
} from '@domain/port/IJobEnrichment.port';
import { source_type } from '@shared/enums/source.enum';

const mockJobData: JobDataProcessed = {
  title: 'Senior Frontend Engineer',
  company: 'Stelfox Tech Recruitment',
  description: 'A great job description.',
  salary_range: '',
  location: 'Cork, County Cork, Ireland',
};

describe('JobEnrichmentsConsumerService', () => {
  let service: JobEnrichmentsConsumerService;
  let linkedinUseCase: jest.Mocked<IEnrichmentUseCase>;
  let factory: jest.Mocked<EnrichmentUseCaseFactory>;
  let jobsApiClient: jest.Mocked<JobsApiClient>;

  beforeEach(() => {
    linkedinUseCase = { execute: jest.fn() } as jest.Mocked<IEnrichmentUseCase>;
    factory = {
      getUseCase: jest.fn(),
    } as unknown as jest.Mocked<EnrichmentUseCaseFactory>;
    jobsApiClient = { updateJobMetadata: jest.fn() };
    service = new JobEnrichmentsConsumerService(factory, jobsApiClient);
  });

  describe('process', () => {
    it('should call use case from factory and update metadata', async () => {
      factory.getUseCase.mockReturnValue(linkedinUseCase);
      linkedinUseCase.execute.mockResolvedValue(mockJobData);
      jobsApiClient.updateJobMetadata.mockResolvedValue(undefined);

      await service.process({
        jobId: 'job-123',
        sourceUrl: 'https://www.linkedin.com/jobs/view/4404558700/',
        sourcePlatform: source_type.linkedin,
      });

      expect(factory.getUseCase).toHaveBeenCalledWith(source_type.linkedin);
      expect(linkedinUseCase.execute).toHaveBeenCalledWith(
        'https://www.linkedin.com/jobs/view/4404558700/',
      );
      expect(jobsApiClient.updateJobMetadata).toHaveBeenCalledWith(
        'job-123',
        mockJobData,
      );
    });

    it('should do nothing when factory returns no use case for platform', async () => {
      factory.getUseCase.mockReturnValue(undefined);

      await service.process({
        jobId: 'job-123',
        sourceUrl: 'https://example.com/job/123',
        sourcePlatform: source_type.other,
      });

      expect(linkedinUseCase.execute).not.toHaveBeenCalled();
      expect(jobsApiClient.updateJobMetadata).not.toHaveBeenCalled();
    });

    it('should propagate errors from use case', async () => {
      factory.getUseCase.mockReturnValue(linkedinUseCase);
      linkedinUseCase.execute.mockRejectedValue(new Error('Processing failed'));

      await expect(
        service.process({
          jobId: 'job-123',
          sourceUrl: 'https://www.linkedin.com/jobs/view/4404558700/',
          sourcePlatform: source_type.linkedin,
        }),
      ).rejects.toThrow('Processing failed');
    });

    it('should propagate errors from JobsApiClient', async () => {
      factory.getUseCase.mockReturnValue(linkedinUseCase);
      linkedinUseCase.execute.mockResolvedValue(mockJobData);
      jobsApiClient.updateJobMetadata.mockRejectedValue(new Error('API down'));

      await expect(
        service.process({
          jobId: 'job-123',
          sourceUrl: 'https://www.linkedin.com/jobs/view/4404558700/',
          sourcePlatform: source_type.linkedin,
        }),
      ).rejects.toThrow('API down');
    });
  });
});
