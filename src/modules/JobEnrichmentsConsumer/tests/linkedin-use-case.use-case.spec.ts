import { LinkedinUseCase } from '../use-cases/linkedin-use-case.use-case';
import { IJobEnrichmentProcessor, JobDataProcessed } from '@domain/port/IJobEnrichment.port';

const mockJobData: JobDataProcessed = {
  title: 'Senior Frontend Engineer',
  company: 'Stelfox Tech Recruitment',
  description: 'A great job description.',
  salary_range: '',
  location: 'Cork, County Cork, Ireland',
};

describe('LinkedinUseCase', () => {
  let useCase: LinkedinUseCase;
  let processor: jest.Mocked<IJobEnrichmentProcessor>;

  beforeEach(() => {
    processor = {
      processContent: jest.fn(),
    };
    useCase = new LinkedinUseCase(processor);
  });

  it('should call processContent with the provided sourceUrl', async () => {
    processor.processContent.mockResolvedValue(mockJobData);
    const url = 'https://www.linkedin.com/jobs/view/4404558700/';

    await useCase.execute(url);

    expect(processor.processContent).toHaveBeenCalledWith(url);
    expect(processor.processContent).toHaveBeenCalledTimes(1);
  });

  it('should return the JobDataProcessed from the processor', async () => {
    processor.processContent.mockResolvedValue(mockJobData);

    const result = await useCase.execute('https://www.linkedin.com/jobs/view/4404558700/');

    expect(result).toEqual(mockJobData);
  });

  it('should propagate errors thrown by the processor', async () => {
    processor.processContent.mockRejectedValue(new Error('API error'));

    await expect(
      useCase.execute('https://www.linkedin.com/jobs/view/4404558700/'),
    ).rejects.toThrow('API error');
  });
});
