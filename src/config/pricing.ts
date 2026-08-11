export interface PlanConfig {
  id: 'free' | 'starter' | 'pro' | 'premium';
  name: string;
  badge?: string;
  priceUsd: number;
  priceInr: number;
  monthlyCredits: number;
  description: string;
  features: string[];
  maxProjects: number;
  priority: 'standard' | 'high' | 'ultra';
  popular?: boolean;
}

export interface CreditPackConfig {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  priceInr: number;
  discount?: string;
}

export const CREDIT_COSTS = {
  GENERATE_WEBSITE: 20,
  AI_EDIT: 10,
  AI_CHAT: 2,
  REGENERATE_WEBSITE: 20,
};

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'FREE',
    priceUsd: 0,
    priceInr: 0,
    monthlyCredits: 200,
    description: 'Perfect for exploring and creating your first AI websites.',
    features: [
      '200 free credits every month',
      'Basic AI website generation',
      'Real-time AI editing',
      'Project saving & management',
      'Full source code & ZIP export',
      'Standard generation speed',
    ],
    maxProjects: 10,
    priority: 'standard',
  },
  starter: {
    id: 'starter',
    name: 'STARTER',
    badge: 'Popular',
    priceUsd: 12,
    priceInr: 999,
    monthlyCredits: 1000,
    description: 'Great for creators and freelancers building multiple sites.',
    features: [
      '1,000 monthly credits',
      'Advanced AI website generation',
      'Unlimited AI code edits',
      'Up to 30 active projects',
      'Instant ZIP exports & deploy files',
      'High priority generation queue',
    ],
    maxProjects: 30,
    priority: 'high',
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    badge: 'Best Value',
    priceUsd: 29,
    priceInr: 2499,
    monthlyCredits: 3000,
    description: 'Designed for agencies, developers, and power users.',
    features: [
      '3,000 monthly credits',
      'Premium multi-page generation',
      'Priority AI editing engine',
      'Up to 100 active projects',
      'Full custom domain export support',
      '24/7 Priority support',
    ],
    maxProjects: 100,
    priority: 'high',
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    badge: 'Unlimited Scale',
    priceUsd: 79,
    priceInr: 5999,
    monthlyCredits: 10000,
    description: 'Maximum power for large teams and high-volume output.',
    features: [
      '10,000 monthly credits',
      'Highest quality AI generation models',
      'Unlimited project capacity',
      'Custom branding & export presets',
      'Ultra-fast generation queue',
      'Dedicated account support',
    ],
    maxProjects: 999,
    priority: 'ultra',
  },
};

export const CREDIT_PACKS: CreditPackConfig[] = [
  {
    id: 'pack_500',
    name: 'Booster Pack',
    credits: 500,
    priceUsd: 5,
    priceInr: 399,
  },
  {
    id: 'pack_1500',
    name: 'Pro Pack',
    credits: 1500,
    priceUsd: 12,
    priceInr: 999,
    discount: '15% OFF',
  },
  {
    id: 'pack_5000',
    name: 'Mega Pack',
    credits: 5000,
    priceUsd: 35,
    priceInr: 2799,
    discount: '30% OFF',
  },
];
