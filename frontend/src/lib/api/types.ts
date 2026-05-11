// API Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  country: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  title: string;
  description: string;
  is_rd: boolean;
  rd_score: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  company_id: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  is_rd_related: boolean;
  created_at: string;
}

export interface Claim {
  id: string;
  company_id: string;
  estimated_amount: number;
  rd_expenses_total: number;
  status: 'draft' | 'generated' | 'submitted' | 'approved' | 'rejected';
  generated_text?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRun {
  id: string;
  company_id: string;
  rd_score: number;
  estimated_amount: number;
  details: {
    rd_expenses: number;
    non_rd_expenses: number;
    rd_projects_count: number;
    total_projects_count: number;
  };
  created_at: string;
}

// Request types
export interface CreateCompanyDto {
  name: string;
  country: string;
  industry: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
}

export interface CreateExpenseDto {
  type: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
