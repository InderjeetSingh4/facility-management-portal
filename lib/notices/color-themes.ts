import type { NoticeColorTheme } from '@/types/database'

export interface ColorThemeOption {
  value: NoticeColorTheme
  label: string
}

// Single source of truth for the dropdown options AND server-side
// validation. The database has its own copy of this same list as a CHECK
// constraint (supabase/005_notices.sql) — the two aren't wired together
// automatically, so update both when adding a theme.
export const NOTICE_COLOR_THEMES: ColorThemeOption[] = [
  { value: 'bg-red-500/10 text-red-700', label: 'Urgent Red' },
  { value: 'bg-blue-500/10 text-blue-700', label: 'Info Blue' },
  { value: 'bg-amber-500/10 text-amber-700', label: 'Maintenance Amber' },
]