export interface Follower {
  userId: string;
  username: string;
  name: string;
}

export interface FollowersPayload {
  data: Follower[];
  count: number;
}

