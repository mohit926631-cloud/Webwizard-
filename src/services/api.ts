import { User, Project, ProjectFiles, AppNotification, ProjectVersion, GenerationLog } from '../types';

const TOKEN_KEY = 'vervox_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status?: number; data?: any };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const apiService = {
  // Auth
  sendOTP: async (email: string, name?: string): Promise<{ success: boolean; message: string; email: string; otpCode: string; expiresSeconds: number }> => {
    return request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  },

  verifyOTP: async (email: string, code: string, name?: string): Promise<{ user: User; token: string }> => {
    const data = await request<{ user: User; token: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, name }),
    });
    setStoredToken(data.token);
    return data;
  },

  signup: async (name: string, email: string, password?: string): Promise<{ user: User; token: string }> => {
    const data = await request<{ user: User; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  login: async (email: string, password?: string): Promise<{ user: User; token: string }> => {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  googleLogin: async (name: string, email: string, avatar?: string): Promise<{ user: User; token: string }> => {
    const data = await request<{ user: User; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ name, email, avatar }),
    });
    setStoredToken(data.token);
    return data;
  },

  getMe: async (): Promise<{ user: User }> => {
    return request<{ user: User }>('/api/auth/me', { method: 'GET' });
  },

  logout: async (): Promise<void> => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore error
    } finally {
      setStoredToken(null);
    }
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await request<{ notifications: AppNotification[] }>('/api/notifications', { method: 'GET' });
    return res.notifications;
  },

  markNotificationRead: async (id: string): Promise<boolean> => {
    const res = await request<{ success: boolean }>('/api/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    return res.success;
  },

  markAllNotificationsRead: async (): Promise<boolean> => {
    const res = await request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' });
    return res.success;
  },

  clearNotifications: async (): Promise<boolean> => {
    const res = await request<{ success: boolean }>('/api/notifications/clear', { method: 'DELETE' });
    return res.success;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await request<{ projects: Project[] }>('/api/projects', { method: 'GET' });
    return res.projects;
  },

  saveProject: async (project: Partial<Project>): Promise<Project> => {
    const res = await request<{ project: Project }>('/api/projects/save', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return res.project;
  },

  deleteProject: async (projectId: string): Promise<boolean> => {
    const res = await request<{ success: boolean }>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  deleteProjectById: async (projectId: string): Promise<boolean> => {
    const res = await request<{ success: boolean }>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  duplicateProject: async (projectId: string): Promise<Project> => {
    const res = await request<{ project: Project }>(`/api/projects/${projectId}/duplicate`, {
      method: 'POST',
    });
    return res.project;
  },

  getProjectVersions: async (projectId: string): Promise<ProjectVersion[]> => {
    const res = await request<{ versions: ProjectVersion[] }>(`/api/projects/${projectId}/versions`, { method: 'GET' });
    return res.versions;
  },

  restoreProjectVersion: async (projectId: string, versionId: string): Promise<Project> => {
    const res = await request<{ project: Project }>(`/api/projects/${projectId}/restore/${versionId}`, {
      method: 'POST',
    });
    return res.project;
  },

  getProjectLogs: async (projectId: string): Promise<GenerationLog[]> => {
    const res = await request<{ logs: GenerationLog[] }>(`/api/projects/${projectId}/logs`, { method: 'GET' });
    return res.logs;
  },

  // AI Generation & Editing
  generateWebsite: async (
    prompt: string,
    category?: string
  ): Promise<{ success: boolean; project: Project; files: ProjectFiles; user: User; creditsDeducted: number }> => {
    return request('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, category }),
    });
  },

  editWebsite: async (
    prompt: string,
    currentFiles: ProjectFiles,
    projectId?: string,
    projectName?: string
  ): Promise<{ success: boolean; files: ProjectFiles; explanation: string; project?: Project; user: User; creditsDeducted: number }> => {
    return request('/api/ai-edit', {
      method: 'POST',
      body: JSON.stringify({ prompt, currentFiles, projectId, projectName }),
    });
  },

  aiChat: async (
    message: string,
    projectContext?: ProjectFiles
  ): Promise<{ success: boolean; reply: string; user: User; creditsDeducted: number }> => {
    return request('/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ message, projectContext }),
    });
  },

  // Payment Checkout & Upgrade
  createPaymentOrder: async (
    planId?: string,
    creditPackId?: string,
    currency: 'USD' | 'INR' = 'USD'
  ): Promise<{ orderId: string; amount: number; currency: string; description: string; creditsAdded: number; razorpayKey: string }> => {
    return request('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, creditPackId, currency }),
    });
  },

  claimFreeCredits: async (): Promise<{ success: boolean; message: string; user: User }> => {
    return request('/api/credits/claim-free', {
      method: 'POST',
    });
  },

  verifyPayment: async (
    params: {
      planId?: string;
      creditPackId?: string;
      amount: number;
      currency: 'USD' | 'INR';
      paymentId?: string;
      provider?: 'Razorpay' | 'Stripe' | 'System';
    }
  ): Promise<{ success: boolean; message: string; user: User }> => {
    return request('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
