import axios from 'axios';
import Cookies from 'js-cookie';
import type {
  Company,
  Project,
  Expense,
  Claim,
  AnalysisRun,
  CreateCompanyDto,
  CreateProjectDto,
  CreateExpenseDto,
  LoginDto,
  RegisterDto,
  AuthResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

apiClient.interceptors.request.use((config: any) => {
  const token = Cookies.get('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (data: LoginDto) => apiClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterDto) => apiClient.post<AuthResponse>('/auth/register', data),
  logout: () => {
    Cookies.remove('token');
  },
};

// Company API
export const company = {
  get: () => apiClient.get<Company>('/company'),
  create: (data: CreateCompanyDto) => apiClient.post<Company>('/company', data),
  update: (data: Partial<CreateCompanyDto>) => apiClient.patch<Company>('/company', data),
  supportedCountries: () => apiClient.get<Array<{
    code: string;
    name: string;
    program: string;
    currency: string;
    baseCreditRate: number;
    notes: string;
  }>>('/company/supported-countries'),
};

// Projects API
export const projects = {
  list: () => apiClient.get<Project[]>('/projects'),
  get: (id: string) => apiClient.get<Project>(`/projects/${id}`),
  create: (data: CreateProjectDto) => apiClient.post<Project>('/projects', data),
  update: (id: string, data: Partial<CreateProjectDto>) => 
    apiClient.patch<Project>(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

// Expenses API
export const expenses = {
  list: (companyId: string) => apiClient.get<Expense[]>(`/company/${companyId}/expenses`),
  create: (companyId: string, data: CreateExpenseDto) => 
    apiClient.post<Expense>(`/company/${companyId}/expenses`, data),
  delete: (companyId: string, id: string) => 
    apiClient.delete(`/company/${companyId}/expenses/${id}`),
};

// Analysis API
export const analysis = {
  run: (companyId: string) => apiClient.post<AnalysisRun>(`/company/${companyId}/analysis/run`),
  list: (companyId: string) => apiClient.get<AnalysisRun[]>(`/company/${companyId}/analysis`),
  get: (companyId: string, id: string) => 
    apiClient.get<AnalysisRun>(`/company/${companyId}/analysis/${id}`),
};

// Claims API
export const claims = {
  list: (companyId: string) => apiClient.get<Claim[]>(`/company/${companyId}/claims`),
  get: (companyId: string, id: string) => 
    apiClient.get<Claim>(`/company/${companyId}/claims/${id}`),
  generate: (companyId: string) => 
    apiClient.post<Claim>(`/company/${companyId}/claims/generate`),
  submit: (companyId: string, id: string) => 
    apiClient.post(`/company/${companyId}/claims/${id}/submit`),
  downloadPdf: async (companyId: string, id: string, claimShortId: string) => {
    const token = (await import('js-cookie')).default.get('token');
    const response = await fetch(
      `${API_URL}/company/${companyId}/claims/${id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );
    if (!response.ok) throw new Error('PDF download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grantai-claim-${claimShortId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// Analytics API (internal/admin)
export const analytics = {
  getReport: () => apiClient.get('/analytics'),
};
