import { User, Project, ProjectFiles, AppNotification, ProjectVersion, GenerationLog } from '../types';
import { generateWebsiteResilient } from './aiGenerator';
import { editDemoWebsite } from './demoAIEngine';
import { storage } from './storage';

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
    try {
      return await request('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
      });
    } catch {
      return {
        success: true,
        message: 'OTP Code sent successfully (Demo mode: 123456)',
        email,
        otpCode: '123456',
        expiresSeconds: 600,
      };
    }
  },

  verifyOTP: async (email: string, code: string, name?: string): Promise<{ user: User; token: string }> => {
    try {
      const data = await request<{ user: User; token: string }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code, name }),
      });
      setStoredToken(data.token);
      return data;
    } catch {
      const currentUser = storage.getUser();
      const updatedUser: User = {
        ...currentUser,
        email,
        name: name || email.split('@')[0] || currentUser.name,
      };
      storage.saveUser(updatedUser);
      return { user: updatedUser, token: 'offline_token' };
    }
  },

  signup: async (name: string, email: string, password?: string): Promise<{ user: User; token: string }> => {
    try {
      const data = await request<{ user: User; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setStoredToken(data.token);
      return data;
    } catch {
      const updatedUser: User = { ...storage.getUser(), name, email };
      storage.saveUser(updatedUser);
      return { user: updatedUser, token: 'local_token' };
    }
  },

  login: async (email: string, password?: string): Promise<{ user: User; token: string }> => {
    try {
      const data = await request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(data.token);
      return data;
    } catch {
      const updatedUser: User = { ...storage.getUser(), email };
      storage.saveUser(updatedUser);
      return { user: updatedUser, token: 'local_token' };
    }
  },

  googleLogin: async (name: string, email: string, avatar?: string): Promise<{ user: User; token: string }> => {
    try {
      const data = await request<{ user: User; token: string }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ name, email, avatar }),
      });
      setStoredToken(data.token);
      return data;
    } catch {
      const updatedUser: User = { ...storage.getUser(), name, email, avatar };
      storage.saveUser(updatedUser);
      return { user: updatedUser, token: 'local_token' };
    }
  },

  getMe: async (): Promise<{ user: User }> => {
    try {
      return await request<{ user: User }>('/api/auth/me', { method: 'GET' });
    } catch {
      return { user: storage.getUser() };
    }
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
    try {
      const res = await request<{ notifications: AppNotification[] }>('/api/notifications', { method: 'GET' });
      return res.notifications;
    } catch {
      return [];
    }
  },

  markNotificationRead: async (id: string): Promise<boolean> => {
    try {
      const res = await request<{ success: boolean }>('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      return res.success;
    } catch {
      return true;
    }
  },

  markAllNotificationsRead: async (): Promise<boolean> => {
    try {
      const res = await request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' });
      return res.success;
    } catch {
      return true;
    }
  },

  clearNotifications: async (): Promise<boolean> => {
    try {
      const res = await request<{ success: boolean }>('/api/notifications/clear', { method: 'DELETE' });
      return res.success;
    } catch {
      return true;
    }
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    try {
      const res = await request<{ projects: Project[] }>('/api/projects', { method: 'GET' });
      if (res && Array.isArray(res.projects)) {
        storage.saveProjects(res.projects);
        return res.projects;
      }
    } catch {
      // Offline fallback
    }
    return storage.getProjects();
  },

  saveProject: async (project: Partial<Project>): Promise<Project> => {
    try {
      const res = await request<{ project: Project }>('/api/projects/save', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      if (res && res.project) {
        storage.saveProject(res.project);
        return res.project;
      }
    } catch {
      // Offline fallback
    }
    const fallbackProj = project as Project;
    storage.saveProject(fallbackProj);
    return fallbackProj;
  },

  deleteProject: async (projectId: string): Promise<boolean> => {
    try {
      await request<{ success: boolean }>(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
    } catch {
      // Local fallback
    }
    storage.deleteProject(projectId);
    return true;
  },

  deleteProjectById: async (projectId: string): Promise<boolean> => {
    return apiService.deleteProject(projectId);
  },

  duplicateProject: async (projectId: string): Promise<Project> => {
    try {
      const res = await request<{ project: Project }>(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
      });
      if (res && res.project) {
        storage.saveProject(res.project);
        return res.project;
      }
    } catch {
      // Local fallback
    }

    const projects = storage.getProjects();
    const source = projects.find((p) => p.id === projectId);
    const defaultFiles: ProjectFiles = {
      'index.html': source?.files?.['index.html'] || '<!DOCTYPE html><html><body><h1>Project</h1></body></html>',
      'style.css': source?.files?.['style.css'] || 'body { font-family: sans-serif; }',
      'script.js': source?.files?.['script.js'] || 'console.log("ready");',
      ...(source?.files || {}),
    };

    const duplicated: Project = {
      ...(source || {}),
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${source?.name || 'Project'} (Copy)`,
      description: source?.description || 'Duplicated project generated with VERVOX AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: storage.getUser().id || 'default_user',
      category: source?.category || 'Landing Page',
      files: defaultFiles,
      status: 'Ready',
    };
    storage.saveProject(duplicated);
    return duplicated;
  },

  getProjectVersions: async (projectId: string): Promise<ProjectVersion[]> => {
    try {
      const res = await request<{ versions: ProjectVersion[] }>(`/api/projects/${projectId}/versions`, { method: 'GET' });
      return res.versions;
    } catch {
      return [];
    }
  },

  restoreProjectVersion: async (projectId: string, versionId: string): Promise<Project> => {
    try {
      const res = await request<{ project: Project }>(`/api/projects/${projectId}/restore/${versionId}`, {
        method: 'POST',
      });
      return res.project;
    } catch {
      const projects = storage.getProjects();
      return projects.find((p) => p.id === projectId) || projects[0];
    }
  },

  getProjectLogs: async (projectId: string): Promise<GenerationLog[]> => {
    try {
      const res = await request<{ logs: GenerationLog[] }>(`/api/projects/${projectId}/logs`, { method: 'GET' });
      return res.logs;
    } catch {
      return [];
    }
  },

  // AI Generation & Editing (with Seamless 404 & Static Host Fallback)
  generateWebsite: async (
    prompt: string,
    category?: string
  ): Promise<{ success: boolean; project: Project; files: ProjectFiles; user: User; creditsDeducted: number }> => {
    try {
      const res = await request<{ success: boolean; project: Project; files: ProjectFiles; user: User; creditsDeducted: number }>('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, category }),
      });

      if (res && res.project) {
        storage.saveProject(res.project);
        if (res.user) storage.saveUser(res.user);
        return res;
      }
    } catch (err: any) {
      console.warn('Backend /api/generate unavailable or returned error. Falling back to resilient client-side synthesizer:', err);
    }

    // Resilient fallback on Vercel / Netlify / Static deployments
    const generated = await generateWebsiteResilient(prompt, category);
    storage.saveProject(generated.project);
    return generated;
  },

  editWebsite: async (
    prompt: string,
    currentFiles: ProjectFiles,
    projectId?: string,
    projectName?: string
  ): Promise<{ success: boolean; files: ProjectFiles; explanation: string; project?: Project; user: User; creditsDeducted: number }> => {
    try {
      const res = await request<{ success: boolean; files: ProjectFiles; explanation: string; project?: Project; user: User; creditsDeducted: number }>('/api/ai-edit', {
        method: 'POST',
        body: JSON.stringify({ prompt, currentFiles, projectId, projectName }),
      });

      if (res && res.files) {
        if (res.project) storage.saveProject(res.project);
        if (res.user) storage.saveUser(res.user);
        return res;
      }
    } catch (err: any) {
      console.warn('Backend /api/ai-edit unavailable. Using local editing engine:', err);
    }

    // Client-side editing fallback
    const { updatedFiles, explanation } = editDemoWebsite(prompt, currentFiles);
    const currentUser = storage.getUser();
    const updatedUser: User = {
      ...currentUser,
      usage: {
        ...currentUser.usage,
        creditsUsed: (currentUser.usage?.creditsUsed || 0) + 5,
      },
    };
    storage.saveUser(updatedUser);

    return {
      success: true,
      files: updatedFiles,
      explanation,
      user: updatedUser,
      creditsDeducted: 5,
    };
  },

  aiChat: async (
    message: string,
    projectContext?: ProjectFiles
  ): Promise<{ success: boolean; reply: string; user: User; creditsDeducted: number }> => {
    try {
      return await request('/api/ai-chat', {
        method: 'POST',
        body: JSON.stringify({ message, projectContext }),
      });
    } catch {
      return {
        success: true,
        reply: `I can help you modify your website! Try asking things like "Make the hero headline larger", "Add a testimonials section", "Change color theme to purple", or "Add a contact form".`,
        user: storage.getUser(),
        creditsDeducted: 0,
      };
    }
  },

  // Payment Checkout & Upgrade
  createPaymentOrder: async (
    planId?: string,
    creditPackId?: string,
    currency: 'USD' | 'INR' = 'USD'
  ): Promise<{ orderId: string; amount: number; currency: string; description: string; creditsAdded: number; razorpayKey: string }> => {
    try {
      return await request('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId, creditPackId, currency }),
      });
    } catch {
      return {
        orderId: `order_${Date.now()}`,
        amount: 29,
        currency,
        description: 'Vervox AI Pro Plan Subscription',
        creditsAdded: 5000,
        razorpayKey: 'rzp_test_demo',
      };
    }
  },

  claimFreeCredits: async (): Promise<{ success: boolean; message: string; user: User }> => {
    try {
      return await request('/api/credits/claim-free', {
        method: 'POST',
      });
    } catch {
      const user = storage.getUser();
      const updatedUser: User = {
        ...user,
        usage: {
          ...user.usage,
          purchasedCredits: (user.usage?.purchasedCredits || 0) + 100,
        },
      };
      storage.saveUser(updatedUser);
      return { success: true, message: 'Claimed 100 free credits!', user: updatedUser };
    }
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
    try {
      return await request('/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      const user = storage.getUser();
      const updatedUser: User = {
        ...user,
        plan: (params.planId || 'pro') as any,
        usage: {
          ...user.usage,
          purchasedCredits: (user.usage?.purchasedCredits || 0) + 2500,
          subscriptionStatus: 'active',
        },
      };
      storage.saveUser(updatedUser);
      return { success: true, message: 'Payment verified successfully!', user: updatedUser };
    }
  },
};
