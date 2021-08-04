import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { initApiRequest, Services } from "@/api";
import { TeamView } from "@/views/TeamView";
import { ProjectsView } from "@/views/ProjectsView";
import { useAuth } from "@/hooks/use-auth";
import { theme } from "@gliff-ai/style";
import {
  AppBar,
  CssBaseline,
  Grid,
  Toolbar,
  ThemeProvider,
} from "@material-ui/core";
import {
  createGenerateClassName,
  makeStyles,
  StylesProvider,
} from "@material-ui/core/styles";
import { imgSrc } from "@/imgSrc";

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
  launchCurateCallback?: (projectUid: string) => void;
}

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
              src={imgSrc("gliff-master-black")}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
  const generateClassName = createGenerateClassName({
    seed: "manage",
    disableGlobal: true,
  });

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        {appbar}
        <CssBaseline />
        <div style={{ marginTop: props.showAppBar ? "108px" : "20px" }}>
          <Routes>
            <Route path="//*">
              <Route path="/">
                <Navigate to="projects" />
              </Route>
              <Route path="team" element={<TeamView services={services} />} />
              <Route
                path="projects"
                element={
                  <ProjectsView
                    services={services}
                    launchCurateCallback={props.launchCurateCallback}
                  />
                }
              />
            </Route>
          </Routes>
        </div>
      </ThemeProvider>
    </StylesProvider>
  );
}

UserInterface.defaultProps = {
  services: defaultServices,
  user: undefined as User,
  launchCurateCallback: undefined,
};

export { Services };
