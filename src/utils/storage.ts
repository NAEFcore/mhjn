// Persistent Storage Utility for articles, reporters, cultural events, auth user, and ad settings
import { Article, Reporter, CulturalEvent, AuthUser, AdSettings } from '../types';
import { INITIAL_ARTICLES, REPORTERS_DATA, CULTURAL_EVENTS } from '../data/mockNews';

const STORAGE_KEYS = {
  ARTICLES_CURRENT: 'kculture_articles_v4_master',
  ARTICLES_LEGACY: 'kculture_articles_v3_secure',
  ARTICLES_BACKUP: 'kculture_user_created_articles_backup',
  REPORTERS: 'kculture_reporters_v3_secure',
  EVENTS: 'kculture_events_v3_secure',
  AUTH_USER: 'kculture_auth_user_v3',
  BOOKMARKS: 'kculture_bookmarks_v3',
  GAS_WEBHOOK_URL: 'kculture_gas_webhook_url_v3',
  AD_SETTINGS: 'kculture_ad_settings_v1',
};

export const DEFAULT_AD_SETTINGS: AdSettings = {
  belowSubtitle: '',
  inBody: '',
  afterBody: '',
  sidebarTop: '',
  sidebarBottom: '',
};

// Load saved articles with smart multi-key fallback & user-created preservation
export function loadPersistedArticles(): Article[] {
  try {
    // 1. Try current master key
    const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES_CURRENT) || localStorage.getItem(STORAGE_KEYS.ARTICLES_LEGACY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load articles from storage:', e);
  }

  // 2. Try user backup key
  try {
    const backup = localStorage.getItem(STORAGE_KEYS.ARTICLES_BACKUP);
    if (backup) {
      const parsedBackup = JSON.parse(backup);
      if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
        // Merge with initial articles without losing user articles
        const userArticleIds = new Set(parsedBackup.map((a: Article) => a.id));
        const nonDuplicateInitials = INITIAL_ARTICLES.filter(a => !userArticleIds.has(a.id));
        return [...parsedBackup, ...nonDuplicateInitials];
      }
    }
  } catch {}

  return INITIAL_ARTICLES;
}

// Save articles permanently across multiple safety slots and server backend
export function savePersistedArticles(articles: Article[]): void {
  try {
    const jsonStr = JSON.stringify(articles);
    localStorage.setItem(STORAGE_KEYS.ARTICLES_CURRENT, jsonStr);
    localStorage.setItem(STORAGE_KEYS.ARTICLES_LEGACY, jsonStr);

    // Save custom/user articles to dedicated backup key
    const customArticles = articles.filter(a => a.id.startsWith('art-user-') || a.id.startsWith('art-sheet-') || a.id.startsWith('art-wp-'));
    if (customArticles.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES_BACKUP, JSON.stringify(customArticles));
    }

    // Also broadcast to server backend in background if available
    fetch('/api/articles/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save articles to storage:', e);
  }
}

// Load saved ad settings
export function loadPersistedAdSettings(): AdSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AD_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        belowSubtitle: parsed.belowSubtitle || '',
        inBody: parsed.inBody || '',
        afterBody: parsed.afterBody || '',
        sidebarTop: parsed.sidebarTop || '',
        sidebarBottom: parsed.sidebarBottom || '',
      };
    }
  } catch (e) {
    console.warn('Failed to load ad settings:', e);
  }
  return DEFAULT_AD_SETTINGS;
}

// Save ad settings permanently
export function savePersistedAdSettings(settings: AdSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AD_SETTINGS, JSON.stringify(settings));
    fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ads: settings }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save ad settings:', e);
  }
}

// Load saved reporters
export function loadPersistedReporters(): Reporter[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load reporters from storage:', e);
  }
  return REPORTERS_DATA;
}

// Save reporters permanently
export function savePersistedReporters(reporters: Reporter[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTERS, JSON.stringify(reporters));
  } catch (e) {
    console.error('Failed to save reporters:', e);
  }
}

// Load saved cultural events
export function loadPersistedEvents(): CulturalEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load events from storage:', e);
  }
  return CULTURAL_EVENTS;
}

// Save cultural events permanently
export function savePersistedEvents(events: CulturalEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events:', e);
  }
}

// Load saved user session
export function loadPersistedUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load user:', e);
  }
  return null;
}

// Save user session
export function savePersistedUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

// Google Apps Script Webhook URL for Google Spreadsheet & MailApp
export function getGasWebhookUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.GAS_WEBHOOK_URL) || '';
  } catch {
    return '';
  }
}

export function setGasWebhookUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAS_WEBHOOK_URL, url);
  } catch {}
}

