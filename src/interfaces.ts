export interface User {
  email: string;
  authToken: string;
  userAccess: UserAccess;
  tierID: number;
}

export type Progress = {
  [uid: string]: {
    total: number; // number of assigned images
    complete: number; // number of images with a complete annotation
  };
};

export enum UserAccess {
  Owner = "owner",
  Member = "member",
  Collaborator = "collaborator",
}

export type Project = {
  uid: string;
  name: string;
};

export type ProjectsUsers = {
  [uid: string]: ProjectUsers;
};

export type ProjectUsers = { usernames: string[]; pendingUsernames: string[] };

export type TrustedService = {
  name: string;
  base_url: string;
};

export interface Profile {
  email: string;
  name: string;
  is_collaborator?: boolean;
  is_trusted_service?: boolean;
}

export interface Team {
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
    is_collaborator: boolean;
  }>;
}
