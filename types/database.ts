// ----------------------------------------------------------------------------
// Hand-written type stub — covers ONLY what the auth flow touches (`users`
// and the public `plant_directory` view). Replace this file once you have
// CLI access, with the real generated types:
//
//   npx supabase gen types typescript --project-id <ref> --schema public > types/database.ts
//
// That command will add `plants`, `rooms`, and `tasks` too. Until then, don't
// reach for `.from('plants' | 'rooms' | 'tasks')` against this file — it'll
// correctly fail to type-check, which is your reminder to regenerate.
// ----------------------------------------------------------------------------

export type UserRole = 'super_admin' | 'local_admin' | 'cleaner' | 'employee'
export type ComplaintStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type NoticeColorTheme =
  | 'bg-red-500/10 text-red-700'
  | 'bg-blue-500/10 text-blue-700'
  | 'bg-amber-500/10 text-amber-700'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          plant_id: string | null
          role: UserRole
          full_name: string
          phone: string | null
          designation: string | null
          is_on_duty: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          plant_id?: string | null
          role?: UserRole
          full_name: string
          phone?: string | null
          designation?: string | null
          is_on_duty?: boolean
          avatar_url?: string | null
        }
        Update: {
          plant_id?: string | null
          role?: UserRole
          full_name?: string
          phone?: string | null
          designation?: string | null
          is_on_duty?: boolean
          avatar_url?: string | null
        }
      }
      complaints: {
        Row: {
          id: string
          user_id: string
          plant_id: string
          title: string
          image_url: string
          description: string
          status: ComplaintStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plant_id: string
          title: string
          image_url: string
          description: string
          status?: ComplaintStatus
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          status?: ComplaintStatus
        }
      }
      notices: {
        Row: {
          id: string
          created_at: string
          title: string
          details: string
          date_string: string
          color_theme: NoticeColorTheme
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          details: string
          date_string: string
          color_theme: NoticeColorTheme
        }
        Update: {
          title?: string
          details?: string
          date_string?: string
          color_theme?: NoticeColorTheme
        }
      }
    }
    Views: {
      plant_directory: {
        Row: {
          id: string
          name: string
          code: string
        }
      }
    }
  }
}