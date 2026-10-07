export interface URLItem {
  id: number;
  url: string;
  short_code: string;
  click_count: number;
  created_at: string;
}

export interface URLStats {
  id: number;
  short_code: string;
  original_url: string;
  click_count: number;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
