import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

import { initApiRequest, Services } from "@/api";
import { UsersView } from "@/views/UsersView";
import { ProjectsView } from "@/views/ProjectsView";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider, theme } from "@/theme";

export { ProvideAuth } from "@/hooks/use-auth";

type User = {
  email: string;
  authToken: string;
};

const defaultServices = {
  queryTeam: "GET /team",
  loginUser: "POST /user/login",
  inviteUser: "POST /user/invite",
  getProjects: "GET /projects",
  getProject: "GET /project", // TODO: Support named params for GET? Body works tho...
  createProject: "POST /projects",
  inviteToProject: "POST /projects/invite",
} as Services;

interface Props {
  apiUrl: string;
  services?: Readonly<typeof defaultServices>;
  user?: User; // Optional mock user
}

const defaultProps = {
  services: defaultServices,
  user: undefined as User,
};

export function UserInterface(props: Props): JSX.Element {
  const auth = useAuth();

  // This loads all the services we use, which are either API requests, or functions that allow us to mock etc.
  const services = initApiRequest(props.apiUrl, props.services);

  useEffect(() => {
    if (!auth?.user && props.user) {
      // Autologin if we've been passed a login
      const { email, authToken } = props.user;
      auth.saveUser(email, authToken);
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Link to="users">Users</Link>
        &nbsp;
        <Link to="projects">Projects</Link>
        &nbsp;
        <br />
        <br />
        <br />
        <Routes>
          <Route path="//*">
            <Route path="users" element={<UsersView services={services} />} />
            <Route
              path="projects"
              element={<ProjectsView services={services} />}
            />
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}

UserInterface.defaultProps = defaultProps;

export { Services };
