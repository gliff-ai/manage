import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

import { initApiRequest, Services } from "@/api";
import { UsersView } from "@/views/UsersView";
import { ProjectsView } from "@/views/ProjectsView";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider, theme } from "@/theme";
import { AppBar, CssBaseline, Grid, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
  showAppBar: boolean;
}

const defaultProps = {
  services: defaultServices,
  user: undefined as User,
};

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: "white",
    height: "90px",
    paddingTop: "9px",
  },
  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
}));

export function UserInterface(props: Props): JSX.Element {
  const classes = useStyles();

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

  const appbar = props.showAppBar && (
    <AppBar position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row">
          <Grid item className={classes.logo}>
            <img
              /* eslint-disable global-require */
              src={require(`./assets/gliff-master-black.svg`) as string}
              /* eslint-enable global-require */
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );

  return (
    <ThemeProvider theme={theme}>
      {appbar}
      <CssBaseline />
      <div style={{ marginTop: props.showAppBar ? "108px" : "0px" }}>
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
