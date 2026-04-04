export interface JobApplication {
  id: number;
  company: string;
  position: string;
  url: string;
  location: string;
  status: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  status_display: string;
  description: string;
  notes: string;
  deadline: string | null;
  date_applied: string | null;
  match_score: number | null;
  calendar_event_id: string;
  interview_datetime: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchScoreResult {
  score: number;
  category_scores?: {
    technical_skills?: number;
    experience_level?: number;
    domain_knowledge?: number;
    education?: number;
    soft_skills?: number;
  };
  matched_skills?: string[];
  missing_keywords?: string[];
  summary?: string;
}
