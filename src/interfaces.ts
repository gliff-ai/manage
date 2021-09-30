export interface User {
  email: string;
  authToken: string;
  isOwner: boolean;
}

export type Project = {
  uid: string;
  name: string;
};

export type TrustedService = {
  name: string;
  base_url: string;
};

export interface Profile {
  email: string;
  name: string;
  is_collaborator: boolean;
}

export interface Team {
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
    is_collaborator: boolean;
  }>;
}
