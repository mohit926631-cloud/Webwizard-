export type PlanType = 'free' | 'starter' | 'pro' | 'premium';

export interface BillingTransaction {
  id: string;
  date: string;
  amount: number;
  currency: 'USD' | 'INR';
  description: string;
  creditsAdded: number;
  planPurchased?: PlanType;
  status: 'completed' | 'pending' | 'failed';
  provider: 'Razorpay' | 'Stripe' | 'System';
  paymentId?: string;
  invoiceUrl?: string;
}

export interface UserUsage {
  monthlyCredits: number;
  maxMonthlyCredits: number;
  purchasedCredits: number;
  creditsUsed: number;
  lastCreditResetDate: string;
  subscriptionStatus: 'active' | 'canceled' | 'none';
  subscriptionRenewalDate: string;
  generationsUsed: number;
  maxGenerations: number;
  projectsCount: number;
  maxProjects: number;
  storageMb: number;
  maxStorageMb: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: PlanType;
  usage: UserUsage;
  billingHistory?: BillingTransaction[];
  byokKey?: string;
  rememberMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFiles {
  'index.html': string;
  'style.css': string;
  'script.js': string;
  'README.md'?: string;
  [key: string]: string | undefined;
}

export type ProjectStatus = 'Draft' | 'Generating' | 'Building' | 'Ready' | 'Editing' | 'Error' | 'Archived';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  files: ProjectFiles;
  createdAt: string;
  updatedAt: string;
  thumbnailGradient?: string;
  status?: ProjectStatus;
  framework?: string;
  versionNumber?: number;
  lastAction?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  timestamp: string;
  projectId?: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  userId: string;
  versionNumber: number;
  title: string;
  filesSnapshot: ProjectFiles;
  createdAt: string;
  author: 'AI' | 'User';
}

export interface GenerationLog {
  id: string;
  projectId: string;
  userId: string;
  operationType: 'Generation' | 'Edit' | 'Import' | 'Restore';
  startTime: string;
  completionTime: string;
  durationSeconds: number;
  status: 'Completed' | 'Failed' | 'Cancelled';
  creditsUsed: number;
  filesChanged: string[];
  errorInfo?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'Portfolio' | 'Business' | 'Gaming' | 'Education' | 'Restaurant' | 'Blog' | 'Agency' | 'E-commerce' | 'Landing Page' | 'Personal';
  previewGradient: string;
  tags: string[];
  files: ProjectFiles;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionButtons?: boolean;
  fileChangesSummary?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

export type ViewMode =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'create'
  | 'editor'
  | 'templates'
  | 'pricing'
  | 'settings'
  | 'billing'
  | 'models'
  | 'faq';

export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

export interface GenerationStep {
  id: number;
  label: string;
  detail: string;
}
