export interface Follower {
  userId: string;
  username: string;
  name: string;
}

export interface FollowersPayload {
  data: Follower[];
  count: number;
}

export interface Following {
  userId: string;
  username: string;
  name: string;
}

export interface FollowingPayload {
  data: Following[];
  count: number;
}

