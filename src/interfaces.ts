export interface User {
  email: string;
  authToken: string;
  userAccess: UserAccess;
  tierID: number;
}

export enum UserAccess {
  Owner = "owner",
  Member = "member",
  Collaborator = "collaborator",
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
  is_trusted_service: boolean;
}

export interface Team {
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
    is_collaborator: boolean;
  }>;
}
