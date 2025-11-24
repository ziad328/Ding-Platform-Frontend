export interface SuggestedPerson {
  userId: string;
  username: string;
  name: string;
  headline?: string;
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

