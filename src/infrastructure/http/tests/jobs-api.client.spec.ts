import { ConfigService } from '@nestjs/config';
import { JobsApiClient } from '../jobs-api.client';
import { JobDataProcessed } from '@domain/port/IJobEnrichment.port';

const makeConfig = (port?: string) =>
  ({ get: jest.fn().mockReturnValue(port ?? '3000') }) as unknown as ConfigService;

const mockData: JobDataProcessed = {
  title: 'Senior Frontend Engineer',
  company: 'Stelfox Tech Recruitment',
  description: 'A great job description.',
  salary_range: '',
  location: 'Cork, County Cork, Ireland',
};

describe('JobsApiClient', () => {
  let client: JobsApiClient;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use JOBS_API_PORT from ConfigService', async () => {
      client = new JobsApiClient(makeConfig('4000'));

      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch as unknown as typeof fetch;

      await client.updateJobMetadata('job-123', mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/jobs/job-123/metadata',
        expect.any(Object),
      );
    });

    it('should default to port 3000 when JOBS_API_PORT is not set', async () => {
      client = new JobsApiClient(makeConfig());

      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch as unknown as typeof fetch;

      await client.updateJobMetadata('job-123', mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/jobs/job-123/metadata',
        expect.any(Object),
      );
    });
  });

  describe('updateJobMetadata', () => {
    beforeEach(() => {
      client = new JobsApiClient(makeConfig());
    });

    it('should make a PATCH request with JSON body', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch as unknown as typeof fetch;

      await client.updateJobMetadata('job-123', mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/jobs/job-123/metadata'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockData),
        }),
      );
    });

    it('should resolve without error on successful response', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

      await expect(client.updateJobMetadata('job-123', mockData)).resolves.toBeUndefined();
    });

    it('should throw an Error when the API returns a non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }) as unknown as typeof fetch;

      await expect(client.updateJobMetadata('job-123', mockData)).rejects.toThrow(
        'Jobs API error 500 for job job-123',
      );
    });
  });
});
