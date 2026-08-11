import { Project, User } from '../types';
import { getStoredToken, setStoredToken } from './api';

const USER_KEY = 'vervox_current_user_v2';
const BYOK_KEY = 'vervox_byok_key_v1';

export function getStoredUser(): User | null {
  try {
    const token = getStoredToken();
    if (!token) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading user from storage', e);
  }
  return null;
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

export const storage = {
  getUser: getStoredUser,
  saveUser: saveStoredUser,
  clearUser: () => saveStoredUser(null),
  getByok: getStoredByok,
  saveByok: saveStoredByok,
};
