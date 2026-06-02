import { mapLinkedinToJobData } from '../mappers/linkedin.mapper';
import { LinkedinApiResponseData } from '../types/linkedin-api-response.type';

const mockApiData: LinkedinApiResponseData = {
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
};

describe('mapLinkedinToJobData', () => {
  it('should map all fields correctly', () => {
    const result = mapLinkedinToJobData(mockApiData);

    expect(result.title).toBe(mockApiData.title);
    expect(result.company).toBe(mockApiData.companyName);
    expect(result.description).toBe(mockApiData.description);
    expect(result.location).toBe(mockApiData.location);
  });

  it('should set salary_range to empty string', () => {
    const result = mapLinkedinToJobData(mockApiData);
    expect(result.salary_range).toBe('');
  });
});
