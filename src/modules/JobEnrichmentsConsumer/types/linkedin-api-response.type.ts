export type LinkedinApiResponseData = {
  acceptingApplications: boolean;
  applicants: number;
  companyName: string;
  description: string;
  employmentType: string;
  id: string;
  industries: string;
  jobFunction: string;
  linkedinCompanyName: string;
  linkedinUrl: string;
  location: string;
  postedTimeAgo: string;
  seniorityLevel: string;
  title: string;
};

export type LinkedinApiResponse = {
  data: LinkedinApiResponseData;
  _links: {
    self: string;
  };
  errors: string[];
  warnings: string[];
  hasError: boolean;
  hasWarning: boolean;
};
