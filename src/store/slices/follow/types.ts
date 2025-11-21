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

export interface Friend {
  userId: string;
  username: string;
  name: string;
}

export interface FriendsPayload {
  data: Friend[];
  count: number;
}

