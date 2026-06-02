import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LinkedinProcessor } from '../repository/linkedinProcessor.repository';
import { LinkedinApiResponse } from '../types/linkedin-api-response.type';

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('mock-api-key'),
} as unknown as ConfigService;

const mockApiResponse: LinkedinApiResponse = {
  data: {
    acceptingApplications: true,
    applicants: 200,
    companyName: 'Stelfox Tech Recruitment',
    description: 'A great job description.',
    employmentType: 'Full-time',
    id: '4404558700',
    industries: 'Software Development',
    jobFunction: 'Information Technology',
    linkedinCompanyName: 'stelfox-it-recruitment',
    linkedinUrl: 'https://ie.linkedin.com/jobs/view/4404558700',
    location: 'Cork, County Cork, Ireland',
    postedTimeAgo: '1 week ago',
    seniorityLevel: 'Mid-Senior level',
    title: 'Senior Frontend Engineer',
  },
  _links: { self: '/v2/linkedin/get?id=4404558700' },
  errors: [],
  warnings: [],
  hasError: false,
  hasWarning: false,
};

describe('LinkedinProcessor', () => {
  let processor: LinkedinProcessor;

  beforeEach(() => {
    processor = new LinkedinProcessor(mockConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processContent', () => {
    it('should throw BadRequestException when jobId cannot be extracted', async () => {
      await expect(
        processor.processContent('https://www.linkedin.com/jobs/search/'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should extract jobId from url pathname', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });
      global.fetch = mockFetch;

      await processor.processContent(
        'https://www.linkedin.com/jobs/view/4404558700/',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('id=4404558700'),
        expect.any(Object),
      );
    });

    it('should extract jobId from currentJobId query param', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });
      global.fetch = mockFetch;

      await processor.processContent(
        'https://www.linkedin.com/jobs/search/?currentJobId=4404558700',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('id=4404558700'),
        expect.any(Object),
      );
    });

    it('should throw BadRequestException when API returns non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
      });

      await expect(
        processor.processContent(
          'https://www.linkedin.com/jobs/view/4404558700/',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return mapped JobDataProcessed on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await processor.processContent(
        'https://www.linkedin.com/jobs/view/4404558700/',
      );

      expect(result).toEqual({
        title: 'Senior Frontend Engineer',
        company: 'Stelfox Tech Recruitment',
        description: 'A great job description.',
        salary_range: '',
        location: 'Cork, County Cork, Ireland',
      });
    });

    it('should send API key from ConfigService in headers', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });
      global.fetch = mockFetch;

      await processor.processContent(
        'https://www.linkedin.com/jobs/view/4404558700/',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-rapidapi-key': 'mock-api-key' }),
        }),
      );
    });
  });
});
