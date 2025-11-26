export interface SuggestedPerson {
  userId: string;
  username?: string;
  name?: string;
  headline?: string;
  bio?: string | null;
  score?: number;
  mutualFriends?: number;
  reason?: string;
  user?: {
    name?: string;
    image?: string | null;
    username?: string;
    headline?: string | null;
    company?: string | null;
    location?: string | null;
  };
}

export interface SuggestionsQueryParams {
  limit?: number;
  offset?: number;
}

export interface SuggestionsPayload {
  data: SuggestedPerson[];
  count: number;
  hasMore?: boolean;
  total?: number;
  nextOffset?: number | null;
}

