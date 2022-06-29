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
  description?: string;
};

export type ProjectDetails = Omit<Project, "uid">;

export type ProjectUsers = {
  [uid: string]: ProjectUser[];
};

export type ProjectUser = {
  name?: string;
  username: string;
  isPending: boolean;
  accessLevel: number;
};

export interface Profile {
  email: string;
  name: string;
  is_collaborator?: boolean;
  is_trusted_service?: boolean;
  is_owner?: boolean;
}

export interface Team {
  profiles: Profile[];
  owner: {
    id: number;
    email: string;
  };
  pending_invites: Array<{
    email: string;
    sent_date: string;
    is_collaborator: boolean;
  }>;
}

export enum Product {
  "CURATE" = "CURATE",
  "ANNOTATE" = "ANNOTATE",
  "ALL" = "ALL",
}

export enum PluginType {
  "Javascript" = "Javascript",
  "Python" = "Python",
  "AI" = "AI",
}

export interface IPlugin {
  username?: string;
  type: PluginType;
  name: string;
  description: string;
  url: string;
  products: Product;
  enabled: boolean;
  collection_uids: string[];
}
