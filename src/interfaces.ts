export interface User {
  email: string | null;
  authToken: string | null;
  userAccess: UserAccess | null;
  tierID: number | null;
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

export interface Plugin {
  type: PluginType;
  author?: string; // only for input plugin data
  origin_id: number | null;
  name: string;
  description: string;
  url: string; // base_url for trusted-services and url for plugins
  products: Product;
  enabled: boolean;
  collection_uids: string[]; // collection uids for the projects the plugin has been added to
  is_public: boolean;
  username?: string; // python and AI plugins' username (i.e., email address)
  public_key?: string; // python and AI plugins only
  encrypted_access_key?: string; // python and AI plugins only
}
