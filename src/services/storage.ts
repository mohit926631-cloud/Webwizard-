import { Project, User } from '../types';
import { getStoredToken, setStoredToken } from './api';

const USER_KEY = 'vervox_current_user_v2';
const BYOK_KEY = 'vervox_byok_key_v1';
const PROJECTS_KEY = 'vervox_saved_projects_v2';

export const DEFAULT_USER: User = {
  id: 'default_user_1',
  name: 'Creator',
  email: 'creator@vervox.ai',
  plan: 'pro',
  usage: {
    monthlyCredits: 5000,
    maxMonthlyCredits: 5000,
    purchasedCredits: 0,
    creditsUsed: 0,
    lastCreditResetDate: new Date().toISOString(),
    subscriptionStatus: 'active',
    subscriptionRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    generationsUsed: 0,
    maxGenerations: 250,
    projectsCount: 0,
    maxProjects: 100,
    storageMb: 0,
    maxStorageMb: 50,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getStoredUser(): User {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Failed reading user from storage', e);
  }
  return DEFAULT_USER;
}

export function saveStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      setStoredToken(null);
    }
  } catch (e) {
    console.error('Failed saving user to storage', e);
  }
}

export function getStoredByok(): string {
  return localStorage.getItem(BYOK_KEY) || '';
}

export function saveStoredByok(key: string): void {
  localStorage.setItem(BYOK_KEY, key);
}

export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading projects from storage', e);
  }
  return [];
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed saving projects to storage', e);
  }
}

export function saveSingleStoredProject(project: Project): void {
  const all = getStoredProjects();
  const index = all.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    all[index] = project;
  } else {
    all.unshift(project);
  }
  saveStoredProjects(all);
}

export function deleteStoredProject(projectId: string): void {
  const all = getStoredProjects();
  const filtered = all.filter((p) => p.id !== projectId);
  saveStoredProjects(filtered);
}

export const storage = {
  getUser: getStoredUser,
  saveUser: saveStoredUser,
  clearUser: () => saveStoredUser(null),
  getByok: getStoredByok,
  saveByok: saveStoredByok,
  getProjects: getStoredProjects,
  saveProjects: saveStoredProjects,
  saveProject: saveSingleStoredProject,
  deleteProject: deleteStoredProject,
};
