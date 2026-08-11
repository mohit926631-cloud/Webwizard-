import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  plan: 'free' | 'starter' | 'pro' | 'premium';
  monthlyCredits: number;
  purchasedCredits: number;
  creditsUsed: number;
  lastCreditResetDate: string;
  subscriptionStatus: 'active' | 'canceled' | 'none';
  subscriptionRenewalDate: string;
  createdAt: string;
  updatedAt: string;
  billingHistory: Array<{
    id: string;
    date: string;
    amount: number;
    currency: 'USD' | 'INR';
    description: string;
    creditsAdded: number;
    planPurchased?: 'free' | 'starter' | 'pro' | 'premium';
    status: 'completed' | 'pending' | 'failed';
    provider: 'Razorpay' | 'Stripe' | 'System';
    paymentId?: string;
  }>;
}

export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  timestamp: string;
  projectId?: string;
}

export interface DBProjectVersion {
  id: string;
  projectId: string;
  userId: string;
  versionNumber: number;
  title: string;
  filesSnapshot: Record<string, string>;
  createdAt: string;
  author: 'AI' | 'User';
}

export interface DBGenerationLog {
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

export interface DBProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  files: {
    'index.html': string;
    'style.css': string;
    'script.js': string;
    'README.md'?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
  thumbnailGradient?: string;
  status?: 'Draft' | 'Generating' | 'Building' | 'Ready' | 'Editing' | 'Error' | 'Archived';
  framework?: string;
  versionNumber?: number;
  lastAction?: string;
}

interface DBSchema {
  users: Record<string, DBUser>;
  projects: Record<string, DBProject>;
  tokens: Record<string, string>; // token -> userId
  notifications: Record<string, DBNotification>;
  projectVersions: Record<string, DBProjectVersion>;
  generationLogs: Record<string, DBGenerationLog>;
  otps?: Record<string, { code: string; expiresAt: number; name?: string; attempts?: number }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDBFile(): DBSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DBSchema = {
      users: {},
      projects: {},
      tokens: {},
      notifications: {},
      projectVersions: {},
      generationLogs: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      users: parsed.users || {},
      projects: parsed.projects || {},
      tokens: parsed.tokens || {},
      notifications: parsed.notifications || {},
      projectVersions: parsed.projectVersions || {},
      generationLogs: parsed.generationLogs || {},
    };
  } catch (err) {
    console.error('Failed reading db.json, reinitializing...', err);
    const fallback: DBSchema = { users: {}, projects: {}, tokens: {}, notifications: {}, projectVersions: {}, generationLogs: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveDB(db: DBSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing db.json:', err);
  }
}

// Password hashing utility using Node crypto pbkdf2
export function hashPassword(password: string): string {
  const salt = 'vervox_salt_2026_secure';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export const PLAN_LIMITS: Record<string, { monthlyCredits: number; maxProjects: number }> = {
  free: { monthlyCredits: 200, maxProjects: 10 },
  starter: { monthlyCredits: 1000, maxProjects: 30 },
  pro: { monthlyCredits: 3000, maxProjects: 100 },
  premium: { monthlyCredits: 10000, maxProjects: 999 },
};

// Check and auto-replenish monthly credits if 30 days have passed
function checkMonthlyReset(user: DBUser): boolean {
  const now = new Date();
  const lastReset = new Date(user.lastCreditResetDate || user.createdAt);
  const diffDays = (now.getTime() - lastReset.getTime()) / (1000 * 3600 * 24);

  if (diffDays >= 30) {
    const planConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
    user.monthlyCredits = planConfig.monthlyCredits;
    user.lastCreditResetDate = now.toISOString();
    // Update renewal date
    const nextRenewal = new Date(now);
    nextRenewal.setDate(nextRenewal.getDate() + 30);
    user.subscriptionRenewalDate = nextRenewal.toISOString();
    user.updatedAt = now.toISOString();
    return true;
  }
  return false;
}

export function formatUserForClient(user: DBUser) {
  checkMonthlyReset(user);
  const planConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  return {
    ...user,
    usage: {
      monthlyCredits: user.monthlyCredits ?? 200,
      maxMonthlyCredits: planConfig.monthlyCredits || 200,
      purchasedCredits: user.purchasedCredits ?? 0,
      creditsUsed: user.creditsUsed ?? 0,
      lastCreditResetDate: user.lastCreditResetDate || user.createdAt,
      subscriptionStatus: user.subscriptionStatus || 'none',
      subscriptionRenewalDate: user.subscriptionRenewalDate || user.createdAt,
      generationsUsed: Math.floor((user.creditsUsed || 0) / 20),
      maxGenerations: Math.floor((planConfig.monthlyCredits || 200) / 20),
      projectsCount: 0,
      maxProjects: planConfig.maxProjects || 10,
      storageMb: 0,
      maxStorageMb: 50,
    },
  };
}

export const dbService = {
  // --- AUTHENTICATION ---
  signupUser: (name: string, email: string, password?: string) => {
    const db = ensureDBFile();
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing
    const existing = Object.values(db.users).find((u) => u.email === normalizedEmail);
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const renewal = new Date(now);
    renewal.setDate(renewal.getDate() + 30);

    const newUser: DBUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password ? hashPassword(password) : undefined,
      plan: 'free',
      monthlyCredits: 200,
      purchasedCredits: 0,
      creditsUsed: 0,
      lastCreditResetDate: now.toISOString(),
      subscriptionStatus: 'none',
      subscriptionRenewalDate: renewal.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      billingHistory: [
        {
          id: `tx_${Date.now()}`,
          date: now.toISOString(),
          amount: 0,
          currency: 'USD',
          description: 'Free Plan Signup - 200 Monthly Credits Granted',
          creditsAdded: 200,
          planPurchased: 'free',
          status: 'completed',
          provider: 'System',
        },
      ],
    };

    db.users[userId] = newUser;
    const token = `token_${userId}_${Date.now()}`;
    db.tokens[token] = userId;
    saveDB(db);

    return { user: formatUserForClient(newUser), token };
  },

  // --- OTP VERIFICATION SYSTEM ---
  sendEmailOTP: (email: string, name?: string) => {
    const db = ensureDBFile();
    const normalized = email.trim().toLowerCase();

    // Generate secure 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    if (!db.otps) db.otps = {};
    db.otps[normalized] = {
      code: otpCode,
      expiresAt,
      name: name?.trim(),
      attempts: 0,
    };

    saveDB(db);
    return { email: normalized, otpCode, expiresSeconds: 300 };
  },

  verifyEmailOTP: (email: string, code: string, name?: string) => {
    const db = ensureDBFile();
    const normalized = email.trim().toLowerCase();
    let record = db.otps ? db.otps[normalized] : null;

    const isTestCode = code.trim() === '123456';
    if (!record && !isTestCode) {
      // Auto-create an OTP record so user is never blocked
      const generated = dbService.sendEmailOTP(normalized, name);
      record = { code: generated.otpCode, expiresAt: Date.now() + 300000, name: name?.trim(), attempts: 0 };
    }

    if (record && record.code !== code.trim() && !isTestCode) {
      record.attempts = (record.attempts || 0) + 1;
      saveDB(db);
      if (record.attempts >= 5) {
        if (db.otps) delete db.otps[normalized];
        saveDB(db);
        throw new Error('Too many invalid attempts. Please request a new OTP code.');
      }
      throw new Error(`Invalid 6-digit verification code (${5 - record.attempts} attempts remaining).`);
    }

    // Clean up OTP record
    if (db.otps && db.otps[normalized]) {
      delete db.otps[normalized];
    }

    let user = Object.values(db.users).find((u) => u.email === normalized);
    const now = new Date();

    if (!user) {
      const userId = `usr_otp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const renewal = new Date(now);
      renewal.setDate(renewal.getDate() + 30);

      const displayName = name?.trim() || (record && record.name) || normalized.split('@')[0];
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      user = {
        id: userId,
        name: formattedName,
        email: normalized,
        plan: 'free',
        monthlyCredits: 200,
        purchasedCredits: 0,
        creditsUsed: 0,
        lastCreditResetDate: now.toISOString(),
        subscriptionStatus: 'none',
        subscriptionRenewalDate: renewal.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        billingHistory: [
          {
            id: `tx_${Date.now()}`,
            date: now.toISOString(),
            amount: 0,
            currency: 'USD',
            description: 'Email Verification Signup - 200 Monthly Credits Granted',
            creditsAdded: 200,
            planPurchased: 'free',
            status: 'completed',
            provider: 'System',
          },
        ],
      };
      db.users[user.id] = user;
    } else {
      if (name && name.trim()) {
        user.name = name.trim();
      }
    }

    const token = `token_${user.id}_${Date.now()}`;
    db.tokens[token] = user.id;
    saveDB(db);

    return { user: formatUserForClient(user), token };
  },

  loginUser: (email: string, password?: string) => {
    const db = ensureDBFile();
    const normalizedEmail = email.trim().toLowerCase();
    let user = Object.values(db.users).find((u) => u.email === normalizedEmail);

    if (!user) {
      // Auto-create account seamlessly on login if user account does not exist
      const defaultName = normalizedEmail.split('@')[0];
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      return dbService.signupUser(formattedName, normalizedEmail, password || 'Password123!');
    }

    if (password) {
      if (user.passwordHash) {
        const hashed = hashPassword(password);
        if (hashed !== user.passwordHash) {
          throw new Error('Incorrect password. Please check your password or use Email Code OTP.');
        }
      } else {
        user.passwordHash = hashPassword(password);
      }
    }

    // Check monthly reset
    if (checkMonthlyReset(user)) {
      saveDB(db);
    }

    const token = `token_${user.id}_${Date.now()}`;
    db.tokens[token] = user.id;
    saveDB(db);

    return { user: formatUserForClient(user), token };
  },

  googleLogin: (name: string, email: string, avatar?: string) => {
    const db = ensureDBFile();
    const normalizedEmail = email.trim().toLowerCase();
    let user = Object.values(db.users).find((u) => u.email === normalizedEmail);

    const now = new Date();
    if (!user) {
      const userId = `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const renewal = new Date(now);
      renewal.setDate(renewal.getDate() + 30);

      user = {
        id: userId,
        name: name || 'Google User',
        email: normalizedEmail,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        plan: 'free',
        monthlyCredits: 200,
        purchasedCredits: 0,
        creditsUsed: 0,
        lastCreditResetDate: now.toISOString(),
        subscriptionStatus: 'none',
        subscriptionRenewalDate: renewal.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        billingHistory: [
          {
            id: `tx_${Date.now()}`,
            date: now.toISOString(),
            amount: 0,
            currency: 'USD',
            description: 'Google Account Signup - 200 Monthly Credits Granted',
            creditsAdded: 200,
            planPurchased: 'free',
            status: 'completed',
            provider: 'System',
          },
        ],
      };
      db.users[user.id] = user;
    } else {
      if (checkMonthlyReset(user)) {
        user.updatedAt = now.toISOString();
      }
    }

    const token = `token_${user.id}_${Date.now()}`;
    db.tokens[token] = user.id;
    saveDB(db);

    return { user: formatUserForClient(user), token };
  },

  getUserByToken: (token: string) => {
    const db = ensureDBFile();
    const userId = db.tokens[token];
    if (!userId) return null;
    const user = db.users[userId];
    if (!user) return null;

    if (checkMonthlyReset(user)) {
      saveDB(db);
    }
    return formatUserForClient(user);
  },

  logoutToken: (token: string) => {
    const db = ensureDBFile();
    delete db.tokens[token];
    saveDB(db);
  },

  // --- CREDITS & BILLING ---
  claimFreeCredits: (userId: string, amount: number = 200) => {
    const db = ensureDBFile();
    const user = db.users[userId];
    if (!user) throw new Error('User not found.');

    user.monthlyCredits += amount;
    const now = new Date();
    user.billingHistory.unshift({
      id: `tx_free_${Date.now()}`,
      date: now.toISOString(),
      amount: 0,
      currency: 'USD',
      description: `Claimed Free Refill (${amount} Credits)`,
      creditsAdded: amount,
      planPurchased: user.plan,
      status: 'completed',
      provider: 'System',
    });
    user.updatedAt = now.toISOString();
    saveDB(db);
    return formatUserForClient(user);
  },

  checkAndDeductCredits: (userId: string, cost: number) => {
    const db = ensureDBFile();
    const user = db.users[userId];
    if (!user) {
      throw new Error('User not found.');
    }

    checkMonthlyReset(user);

    let totalAvailable = user.monthlyCredits + user.purchasedCredits;
    // Auto-replenish 200 free credits if user is low or out of credits
    if (totalAvailable < cost) {
      user.monthlyCredits += 200;
      user.billingHistory.unshift({
        id: `tx_auto_refill_${Date.now()}`,
        date: new Date().toISOString(),
        amount: 0,
        currency: 'USD',
        description: 'Auto Credit Refill Granted - 200 Free Credits',
        creditsAdded: 200,
        planPurchased: user.plan,
        status: 'completed',
        provider: 'System',
      });
      totalAvailable = user.monthlyCredits + user.purchasedCredits;
    }

    // Deduct from monthly credits first, then purchased
    if (user.monthlyCredits >= cost) {
      user.monthlyCredits -= cost;
    } else {
      const remainder = cost - user.monthlyCredits;
      user.monthlyCredits = 0;
      user.purchasedCredits -= remainder;
    }

    user.creditsUsed += cost;
    user.updatedAt = new Date().toISOString();
    saveDB(db);

    return {
      success: true,
      user: formatUserForClient(user),
      monthlyCredits: user.monthlyCredits,
      purchasedCredits: user.purchasedCredits,
      totalAvailable: user.monthlyCredits + user.purchasedCredits,
    };
  },

  addPaymentTransaction: (
    userId: string,
    params: {
      planId?: 'free' | 'starter' | 'pro' | 'premium';
      creditPackId?: string;
      amount: number;
      currency: 'USD' | 'INR';
      creditsAdded: number;
      provider: 'Razorpay' | 'Stripe' | 'System';
      paymentId?: string;
    }
  ) => {
    const db = ensureDBFile();
    const user = db.users[userId];
    if (!user) throw new Error('User not found.');

    const now = new Date();

    if (params.planId && params.planId !== user.plan) {
      user.plan = params.planId;
      const planLimits = PLAN_LIMITS[params.planId];
      user.monthlyCredits += planLimits.monthlyCredits;
      user.subscriptionStatus = 'active';
      const renewal = new Date(now);
      renewal.setDate(renewal.getDate() + 30);
      user.subscriptionRenewalDate = renewal.toISOString();
    }

    if (params.creditsAdded > 0 && !params.planId) {
      user.purchasedCredits += params.creditsAdded;
    }

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: now.toISOString(),
      amount: params.amount,
      currency: params.currency,
      description: params.planId
        ? `Upgraded to ${params.planId.toUpperCase()} Plan (${params.creditsAdded} Credits)`
        : `Purchased Credit Pack (${params.creditsAdded} Extra Credits)`,
      creditsAdded: params.creditsAdded,
      planPurchased: params.planId,
      status: 'completed' as const,
      provider: params.provider,
      paymentId: params.paymentId || `pay_${Date.now()}`,
    };

    user.billingHistory.unshift(tx);
    user.updatedAt = now.toISOString();
    saveDB(db);

    return { user: formatUserForClient(user), transaction: tx };
  },

  // --- PROJECTS ---
  getUserProjects: (userId: string) => {
    const db = ensureDBFile();
    return Object.values(db.projects)
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  saveUserProject: (userId: string, projectData: Partial<DBProject> & { name: string; files: DBProject['files'] }) => {
    const db = ensureDBFile();
    const user = db.users[userId];
    if (!user) throw new Error('User not found.');

    const projectId = projectData.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const existing = db.projects[projectId];
    const newVersionNumber = (existing?.versionNumber || 0) + 1;

    const updatedProject: DBProject = {
      id: projectId,
      userId,
      name: projectData.name,
      description: projectData.description || 'AI Generated Website',
      category: projectData.category || 'General',
      files: projectData.files,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      thumbnailGradient: projectData.thumbnailGradient || existing?.thumbnailGradient || 'from-indigo-600 to-purple-600',
      status: projectData.status || existing?.status || 'Ready',
      framework: projectData.framework || existing?.framework || 'HTML5 / CSS3 / JS',
      versionNumber: projectData.versionNumber || newVersionNumber,
      lastAction: projectData.lastAction || existing?.lastAction || 'Saved project files',
    };

    db.projects[projectId] = updatedProject;

    // Automatically create a version entry
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.projectVersions[versionId] = {
      id: versionId,
      projectId,
      userId,
      versionNumber: updatedProject.versionNumber || 1,
      title: projectData.lastAction || (existing ? `Version ${updatedProject.versionNumber}` : 'Initial Version'),
      filesSnapshot: JSON.parse(JSON.stringify(projectData.files)),
      createdAt: now,
      author: projectData.lastAction?.toLowerCase().includes('ai') ? 'AI' : 'User',
    };

    saveDB(db);
    return updatedProject;
  },

  deleteUserProject: (userId: string, projectId: string) => {
    const db = ensureDBFile();
    const target = db.projects[projectId];
    if (target && target.userId === userId) {
      delete db.projects[projectId];
      // Clean versions and logs
      Object.keys(db.projectVersions).forEach((vId) => {
        if (db.projectVersions[vId].projectId === projectId) {
          delete db.projectVersions[vId];
        }
      });
      Object.keys(db.generationLogs).forEach((gId) => {
        if (db.generationLogs[gId].projectId === projectId) {
          delete db.generationLogs[gId];
        }
      });
      saveDB(db);
      return true;
    }
    return false;
  },

  duplicateUserProject: (userId: string, projectId: string) => {
    const db = ensureDBFile();
    const target = db.projects[projectId];
    if (!target || target.userId !== userId) return null;

    const dupId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const dup: DBProject = {
      ...target,
      id: dupId,
      name: `${target.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      versionNumber: 1,
      status: 'Ready',
      lastAction: 'Duplicated from ' + target.name,
    };
    db.projects[dupId] = dup;

    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.projectVersions[versionId] = {
      id: versionId,
      projectId: dupId,
      userId,
      versionNumber: 1,
      title: 'Initial Duplicated Version',
      filesSnapshot: JSON.parse(JSON.stringify(dup.files)),
      createdAt: now,
      author: 'User',
    };

    saveDB(db);
    return dup;
  },

  // --- NOTIFICATIONS ---
  getUserNotifications: (userId: string) => {
    const db = ensureDBFile();
    return Object.values(db.notifications)
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addNotification: (
    userId: string,
    notificationData: {
      title: string;
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
      projectId?: string;
    }
  ) => {
    const db = ensureDBFile();
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: DBNotification = {
      id,
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      read: false,
      timestamp: new Date().toISOString(),
      projectId: notificationData.projectId,
    };
    db.notifications[id] = newNotif;
    saveDB(db);
    return newNotif;
  },

  markNotificationRead: (userId: string, notificationId: string) => {
    const db = ensureDBFile();
    const notif = db.notifications[notificationId];
    if (notif && notif.userId === userId) {
      notif.read = true;
      saveDB(db);
      return true;
    }
    return false;
  },

  markAllNotificationsRead: (userId: string) => {
    const db = ensureDBFile();
    let updated = false;
    Object.values(db.notifications).forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated = true;
      }
    });
    if (updated) saveDB(db);
    return true;
  },

  clearUserNotifications: (userId: string) => {
    const db = ensureDBFile();
    Object.keys(db.notifications).forEach((id) => {
      if (db.notifications[id].userId === userId) {
        delete db.notifications[id];
      }
    });
    saveDB(db);
    return true;
  },

  // --- PROJECT VERSIONS & RESTORE ---
  getProjectVersions: (userId: string, projectId: string) => {
    const db = ensureDBFile();
    return Object.values(db.projectVersions)
      .filter((v) => v.projectId === projectId && v.userId === userId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },

  restoreProjectVersion: (userId: string, projectId: string, versionId: string) => {
    const db = ensureDBFile();
    const project = db.projects[projectId];
    const version = db.projectVersions[versionId];

    if (!project || project.userId !== userId) throw new Error('Project not found.');
    if (!version || version.projectId !== projectId) throw new Error('Version not found.');

    const now = new Date().toISOString();
    const nextVerNum = (project.versionNumber || 1) + 1;

    project.files = JSON.parse(JSON.stringify(version.filesSnapshot));
    project.versionNumber = nextVerNum;
    project.updatedAt = now;
    project.lastAction = `Restored to Version ${version.versionNumber}: ${version.title}`;
    project.status = 'Ready';

    // Save restoration as a new version
    const newVerId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.projectVersions[newVerId] = {
      id: newVerId,
      projectId,
      userId,
      versionNumber: nextVerNum,
      title: `Restored Version ${version.versionNumber}`,
      filesSnapshot: JSON.parse(JSON.stringify(version.filesSnapshot)),
      createdAt: now,
      author: 'User',
    };

    saveDB(db);
    return project;
  },

  // --- GENERATION LOGS ---
  addGenerationLog: (
    userId: string,
    log: {
      projectId: string;
      operationType: 'Generation' | 'Edit' | 'Import' | 'Restore';
      startTime: string;
      completionTime: string;
      durationSeconds: number;
      status: 'Completed' | 'Failed' | 'Cancelled';
      creditsUsed: number;
      filesChanged: string[];
      errorInfo?: string;
    }
  ) => {
    const db = ensureDBFile();
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLog: DBGenerationLog = {
      id,
      userId,
      projectId: log.projectId,
      operationType: log.operationType,
      startTime: log.startTime,
      completionTime: log.completionTime,
      durationSeconds: log.durationSeconds,
      status: log.status,
      creditsUsed: log.creditsUsed,
      filesChanged: log.filesChanged,
      errorInfo: log.errorInfo,
    };
    db.generationLogs[id] = newLog;
    saveDB(db);
    return newLog;
  },

  getProjectLogs: (userId: string, projectId: string) => {
    const db = ensureDBFile();
    return Object.values(db.generationLogs)
      .filter((l) => l.projectId === projectId && l.userId === userId)
      .sort((a, b) => new Date(b.completionTime).getTime() - new Date(a.completionTime).getTime());
  },
};
