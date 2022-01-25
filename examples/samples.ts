import { UserAccess, TrustedService, JsPlugin } from "@/interfaces";
import type { Services } from "../src";

export const user = {
  email: "a@b.com",
  authToken: "22345",
  userAccess: UserAccess.Owner,
  tierID: 2,
};

export const config = {
  // If defining services, you must define ALL of them as they are not merged with defaults!
  services: {
    queryTeam: () =>
      Promise.resolve({
        profiles: [
          {
            email: "user1@gliff.app",
            name: "Mike Jones",
            is_collaborator: false,
          },
          {
            email: "user2@gliff.app",
            name: "John Smith",
            is_collaborator: false,
          },
          {
            email: "user3@gliff.app",
            name: "Jane James",
            is_collaborator: true,
          },
          {
            email: "trustedservice@gliff.app",
            name: "trusted service 1",
            is_collaborator: false,
            is_trusted_service: true,
          },
        ],
        pending_invites: [
          {
            email: "newuser@gliff.app",
            name: "Joan Wise",
            is_collaborator: false,
          },
          {
            email: "newcollaborator@gliff.app",
            name: "John Walker",
            is_collaborator: true,
          },
        ],
      }),
    loginUser: "GET /login",
    getProject: "GET /project",
    getTeam: "GET /team",
    getProjects: () =>
      Promise.resolve([
        { name: "Project 1", uid: "1" },
        { name: "Project 2", uid: "2" },
      ]),
    getCollaboratorProject: (data) =>
      Promise.resolve([{ name: "Project 1", uid: "1" }]),
    createProject: (data) => Promise.resolve([]),
    inviteUser: (data): Promise<boolean> => Promise.resolve(true),
    inviteCollaborator: (data): Promise<boolean> => Promise.resolve(true),
    inviteToProject: (data): Promise<boolean> => Promise.resolve(true),
    createTrustedService: (data): Promise<string> =>
      Promise.resolve("key key key"),
    getTrustedServices: (data): Promise<TrustedService[]> =>
      Promise.resolve([
        {
          type: "Python",
          name: "python-plugin",
          url: "https://ts.gliff.app",
          products: "ALL",
          enabled: false,
        },
      ]),
    createJsPlugin: (data): Promise<void> => Promise.resolve(),
    getJsPlugins: (data): Promise<JsPlugin[]> =>
      Promise.resolve([
        {
          name: "js-plugin",
          url: "https://plugin.gliff.app",
          products: "CURATE",
          enabled: true,
        },
      ]),
  } as Services,
};

export const getAnnotationProgress = (username: string): Promise<any> =>
  Promise.resolve({
    1: { total: 12, complete: 1 },
    2: { total: 0, complete: 0 },
  });
