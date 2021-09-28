import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserInterface, ProvideAuth } from "../src";
import type { Services } from "../src";

const user = {
  email: "a@b.com",
  authToken: "22345",
};

const config = {
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
    getTrustedServices: (data): Promise<any> =>
      Promise.resolve([{ name: "TS", url: "https://ts.gliff.app" }]),
  } as Services,
};

// We render it here under another route as this is how it will typically be used
ReactDOM.render(
  <ProvideAuth>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/manage/projects" />} />
        <Route
          path="manage/*"
          element={
            <UserInterface
              apiUrl="http://localhost:8000/django/api"
              user={user}
              services={config.services}
              showAppBar
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </ProvideAuth>,
  document.getElementById("react-container")
);
