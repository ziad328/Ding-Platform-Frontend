export interface SuggestedPerson {
  userId: string;
  username: string;
  name: string;
  headline?: string;
}

export interface SuggestionsPayload {
  data: SuggestedPerson[];
  count: number;
}

