export interface User {
  email: string;
  authToken: string;
}

export type Project = {
  uid: string;
  name: string;
};

export interface Profile {
  email: string;
  name: string;
}

export interface Team {
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
  }>;
}
