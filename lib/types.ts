export type SessionPhase =
  | 'setup'
  | 'drawn'
  | 'gifting'
  | 'deadline_reached'
  | 'guessing'
  | 'revealed'
  | 'archived';

export type SessionRecord = {
  id: string;
  name: string;
  host_user_id: string;
  budget: string | null;
  gift_deadline: string | null;
  join_code: string;
  invite_slug: string;
  phase: SessionPhase;
  draw_started_at: string | null;
  revealed_at: string | null;
  created_at: string;
};

export type ProfileRecord = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};
