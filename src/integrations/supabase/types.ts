export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _app_keys: {
        Row: {
          created_at: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      ai_tracks: {
        Row: {
          audio_path: string | null
          created_at: string
          duration_seconds: number
          id: string
          instrumental_path: string | null
          metadata: Json
          prompt: string | null
          title: string
          updated_at: string
          user_id: string
          vocals_path: string | null
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          instrumental_path?: string | null
          metadata?: Json
          prompt?: string | null
          title: string
          updated_at?: string
          user_id: string
          vocals_path?: string | null
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          instrumental_path?: string | null
          metadata?: Json
          prompt?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          vocals_path?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
          user_id?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          bucket: string
          count: number
          user_id: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          user_id: string
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      artist_followers: {
        Row: {
          artist_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          artist_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          artist_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      commercials: {
        Row: {
          brief: Json
          created_at: string
          duration_seconds: number
          final_video_path: string | null
          id: string
          photo_path: string | null
          status: string
          thumbnail_path: string | null
          updated_at: string
          user_id: string
          user_prompt: string
          voice_path: string | null
        }
        Insert: {
          brief?: Json
          created_at?: string
          duration_seconds?: number
          final_video_path?: string | null
          id?: string
          photo_path?: string | null
          status?: string
          thumbnail_path?: string | null
          updated_at?: string
          user_id: string
          user_prompt: string
          voice_path?: string | null
        }
        Update: {
          brief?: Json
          created_at?: string
          duration_seconds?: number
          final_video_path?: string | null
          id?: string
          photo_path?: string | null
          status?: string
          thumbnail_path?: string | null
          updated_at?: string
          user_id?: string
          user_prompt?: string
          voice_path?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          credits: number
          id: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          credits?: number
          id?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          credits?: number
          id?: string
        }
        Relationships: []
      }
      cover_arts: {
        Row: {
          created_at: string
          id: string
          image_path: string
          metadata: Json
          prompt: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          metadata?: Json
          prompt?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          metadata?: Json
          prompt?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      gafads_campaigns: {
        Row: {
          clicks: number
          code: string | null
          created_at: string
          destination_url: string | null
          id: string
          impressions: number
          is_active: boolean
          metadata: Json
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          clicks?: number
          code?: string | null
          created_at?: string
          destination_url?: string | null
          id?: string
          impressions?: number
          is_active?: boolean
          metadata?: Json
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          clicks?: number
          code?: string | null
          created_at?: string
          destination_url?: string | null
          id?: string
          impressions?: number
          is_active?: boolean
          metadata?: Json
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gafads_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          ip_hash: string | null
          metadata: Json
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      gafsite_publications: {
        Row: {
          created_at: string
          gafsite_id: string | null
          id: string
          status: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gafsite_id?: string | null
          id?: string
          status?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          gafsite_id?: string | null
          id?: string
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gafsites: {
        Row: {
          content: Json
          created_at: string
          id: string
          slug: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          slug?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          slug?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gafsync_clips: {
        Row: {
          audio_source: string | null
          bpm: number | null
          created_at: string
          duration_seconds: number
          format: string | null
          id: string
          is_premium_unlocked: boolean
          style: string | null
          title: string
          user_id: string
          video_path: string
          watermark: boolean
        }
        Insert: {
          audio_source?: string | null
          bpm?: number | null
          created_at?: string
          duration_seconds?: number
          format?: string | null
          id?: string
          is_premium_unlocked?: boolean
          style?: string | null
          title: string
          user_id: string
          video_path: string
          watermark?: boolean
        }
        Update: {
          audio_source?: string | null
          bpm?: number | null
          created_at?: string
          duration_seconds?: number
          format?: string | null
          id?: string
          is_premium_unlocked?: boolean
          style?: string | null
          title?: string
          user_id?: string
          video_path?: string
          watermark?: boolean
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          id: string
          module: string
          prompt: string
          result: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module: string
          prompt: string
          result?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module?: string
          prompt?: string
          result?: Json
          user_id?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string
          folio: string
          id: string
          metadata: Json
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folio: string
          id?: string
          metadata?: Json
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folio?: string
          id?: string
          metadata?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      lyrics_drafts: {
        Row: {
          created_at: string
          id: string
          lyrics: string | null
          metadata: Json
          prompt: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lyrics?: string | null
          metadata?: Json
          prompt?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lyrics?: string | null
          metadata?: Json
          prompt?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mcp_connections: {
        Row: {
          config: Json
          connector_id: string
          created_at: string
          display_name: string
          id: string
          kind: string
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          connector_id: string
          created_at?: string
          display_name: string
          id?: string
          kind?: string
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          connector_id?: string
          created_at?: string
          display_name?: string
          id?: string
          kind?: string
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          metadata: Json
          read_at: string | null
          resource_id: string | null
          resource_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json
          read_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json
          read_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          nonce: string
          provider: string
          redirect_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          nonce: string
          provider: string
          redirect_path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          nonce?: string
          provider?: string
          redirect_path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payout_accounts: {
        Row: {
          created_at: string
          details: Json
          holder_name: string | null
          id: string
          is_default: boolean
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          holder_name?: string | null
          id?: string
          is_default?: boolean
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          holder_name?: string | null
          id?: string
          is_default?: boolean
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          method: string | null
          notes: string | null
          receipt_number: string
          receipt_sent_at: string | null
          reference: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          receipt_number?: string
          receipt_sent_at?: string | null
          reference?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          receipt_number?: string
          receipt_sent_at?: string | null
          reference?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "payout_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          handle: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          onboarding_data: Json
          public_enabled: boolean
          referral_code: string | null
          referred_by_code: string | null
          social_links: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          handle?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          onboarding_data?: Json
          public_enabled?: boolean
          referral_code?: string | null
          referred_by_code?: string | null
          social_links?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          handle?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          onboarding_data?: Json
          public_enabled?: boolean
          referral_code?: string | null
          referred_by_code?: string | null
          social_links?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          project_name: string
          scopes: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          project_name: string
          scopes?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          project_name?: string
          scopes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string
          created_at: string
          id: string
          language: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          language?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          language?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_publishes: {
        Row: {
          created_at: string
          error: string | null
          file_count: number
          http_status: number | null
          id: string
          latency_ms: number | null
          metadata: Json
          project_id: string
          snapshot_id: string | null
          status: string
          updated_at: string
          url: string | null
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          file_count?: number
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          project_id: string
          snapshot_id?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          file_count?: number
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          project_id?: string
          snapshot_id?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      project_secrets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
          user_id: string
          value: string | null
          value_encrypted: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
          user_id: string
          value?: string | null
          value_encrypted?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          user_id?: string
          value?: string | null
          value_encrypted?: string | null
        }
        Relationships: []
      }
      project_snapshots: {
        Row: {
          created_at: string
          file_count: number
          files: Json
          id: string
          label: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_count?: number
          files?: Json
          id?: string
          label?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_count?: number
          files?: Json
          id?: string
          label?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      release_likes: {
        Row: {
          created_at: string
          id: string
          release_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          release_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          release_id?: string
          user_id?: string
        }
        Relationships: []
      }
      release_store_status: {
        Row: {
          created_at: string
          id: string
          release_id: string
          status: string
          store: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          release_id: string
          status?: string
          store: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          release_id?: string
          status?: string
          store?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      release_tracks: {
        Row: {
          audio_path: string | null
          created_at: string
          duration_seconds: number
          id: string
          isrc: string | null
          name: string
          position: number
          preview_duration: number
          preview_start: number
          release_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          isrc?: string | null
          name: string
          position?: number
          preview_duration?: number
          preview_start?: number
          release_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          isrc?: string | null
          name?: string
          position?: number
          preview_duration?: number
          preview_start?: number
          release_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      release_validations: {
        Row: {
          ddex_payload: Json | null
          errors: Json
          id: string
          passed: boolean
          release_id: string
          user_id: string
          validated_at: string
          warnings: Json
        }
        Insert: {
          ddex_payload?: Json | null
          errors?: Json
          id?: string
          passed?: boolean
          release_id: string
          user_id: string
          validated_at?: string
          warnings?: Json
        }
        Update: {
          ddex_payload?: Json | null
          errors?: Json
          id?: string
          passed?: boolean
          release_id?: string
          user_id?: string
          validated_at?: string
          warnings?: Json
        }
        Relationships: []
      }
      releases: {
        Row: {
          approved_at: string | null
          artist_name: string
          artist_role: string | null
          artist_type: string
          contributors: Json
          cover_path: string | null
          created_at: string
          distribution_status: string
          express_release: boolean
          genre: string | null
          id: string
          rejection_reason: string | null
          release_date: string | null
          review_status: string
          selected_stores: string[]
          submitted_at: string
          title: string
          upc: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          artist_name: string
          artist_role?: string | null
          artist_type?: string
          contributors?: Json
          cover_path?: string | null
          created_at?: string
          distribution_status?: string
          express_release?: boolean
          genre?: string | null
          id?: string
          rejection_reason?: string | null
          release_date?: string | null
          review_status?: string
          selected_stores?: string[]
          submitted_at?: string
          title: string
          upc?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          artist_name?: string
          artist_role?: string | null
          artist_type?: string
          contributors?: Json
          cover_path?: string | null
          created_at?: string
          distribution_status?: string
          express_release?: boolean
          genre?: string | null
          id?: string
          rejection_reason?: string | null
          release_date?: string | null
          review_status?: string
          selected_stores?: string[]
          submitted_at?: string
          title?: string
          upc?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_distribution_targets: {
        Row: {
          created_at: string
          distribution_id: string | null
          error: string | null
          id: string
          metadata: Json
          provider: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          distribution_id?: string | null
          error?: string | null
          id?: string
          metadata?: Json
          provider: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          distribution_id?: string | null
          error?: string | null
          id?: string
          metadata?: Json
          provider?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_distributions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          monthly_credits: number
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan_tier: string | null
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          monthly_credits?: number
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_tier?: string | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          monthly_credits?: number
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_tier?: string | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          id: string
          message: string | null
          responded_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      track_streams: {
        Row: {
          amount: number
          country: string | null
          id: string
          release_id: string | null
          store: string | null
          streamed_at: string
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number
          country?: string | null
          id?: string
          release_id?: string | null
          store?: string | null
          streamed_at?: string
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          country?: string | null
          id?: string
          release_id?: string | null
          store?: string | null
          streamed_at?: string
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          daily_limit: number
          monthly_allowance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          daily_limit?: number
          monthly_allowance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          daily_limit?: number
          monthly_allowance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          id: string
          payload: Json | null
          processed_at: string
          source: string
        }
        Insert: {
          event_id: string
          id?: string
          payload?: Json | null
          processed_at?: string
          source?: string
        }
        Update: {
          event_id?: string
          id?: string
          payload?: Json | null
          processed_at?: string
          source?: string
        }
        Relationships: []
      }
      youtube_connections: {
        Row: {
          access_token: string | null
          channel_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          channel_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          channel_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      api_rate_limit_hit: {
        Args: { p_bucket: string; p_user_id: string; p_window_seconds: number }
        Returns: number
      }
      assign_isrc_to_track: { Args: { _track_id: string }; Returns: string }
      cleanup_expired_oauth_states: { Args: never; Returns: number }
      consume_credits: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_link?: string
          p_message?: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      decrypt_project_secret: { Args: { _secret_id: string }; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      encrypt_project_secret: { Args: { _value: string }; Returns: string }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      touch_api_key_used: { Args: { p_key_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
