import { api } from './api';
import { JobApplication, MatchScoreResult } from '../types';

export const jobsApi = {
  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get<any>('/jobs/', { params });
    // DRF returns paginated object with 'results' array if pagination is enabled
    // Settings.py defined PageNumberPagination but let's handle both
    return response.data.results ? (response.data.results as JobApplication[]) : (response.data as JobApplication[]);
  },

  getById: async (id: number) => {
    const response = await api.get<JobApplication>(`/jobs/${id}/`);
    return response.data;
  },

  create: async (data: Partial<JobApplication>) => {
    const response = await api.post<JobApplication>('/jobs/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<JobApplication>) => {
    const response = await api.patch<JobApplication>(`/jobs/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/jobs/${id}/`);
  },

  getMatchScore: async (jobId: number) => {
    const response = await api.post<MatchScoreResult>(`/jobs/${jobId}/match/`);
    return response.data;
  },

  generateCoverLetter: async (job_description: string, tone: 'formal' | 'friendly' = 'formal') => {
    const response = await api.post<{ cover_letter: string }>('/ai/cover-letter/', {
      job_description,
      tone,
    });
    return response.data;
  },

  downloadCoverLetter: async (coverLetter: string, company: string) => {
    const response = await api.post('/jobs/download-cover-letter/', {
      cover_letter: coverLetter,
      company: company,
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  scheduleInterview: async (job_id: number, interview_datetime: string) => {
    const response = await api.post<{ message: string; event_id?: string; event_link?: string }>('/calendar/schedule/', {
      job_id,
      interview_datetime,
    });
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/analytics/dashboard/');
    return response.data;
  },

  scrapeJob: async (params: { url?: string; text?: string }) => {
    const response = await api.post<{company: string; position: string; location: string; deadline: string; description?: string}>('/jobs/scrape/', params);
    return response.data;
  }
};
