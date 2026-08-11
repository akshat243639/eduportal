import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or local storage configuration
const ENV_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const STORAGE_URL_KEY = 'eduportal_supabase_url';
const STORAGE_ANON_KEY = 'eduportal_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_URL_KEY) || ENV_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_ANON_KEY) || ENV_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();

  if (!url || !anonKey || url.includes('YOUR_SUPABASE') || anonKey.includes('YOUR_SUPABASE')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}
