import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are missing. Create a .env file from .env.example and restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: today's date in YYYY-MM-DD (local time, not UTC) so the mess day
// lines up with whatever timezone the device is set to.
export function todayStr() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export const MEALS = ['breakfast', 'lunch', 'dinner']
