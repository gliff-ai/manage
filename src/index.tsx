import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  AppBar,
  CssBaseline,
  Grid,
  Toolbar,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import StylesProvider from "@mui/styles/StylesProvider";
import { theme, generateClassName, Logo } from "@gliff-ai/style";

import { initApiRequest, ServiceFunctions } from "@/api";
import { TeamView } from "@/views/TeamView";
import { ProjectsView } from "@/views/ProjectsView";
import { PluginsView } from "./views/PluginsView";

import { useAuth } from "@/hooks/use-auth";
import { CollaboratorsView } from "@/views/CollaboratorsView";

import type { Services } from "@/api";
import { PageSelector } from "./components/PageSelector";
import { User } from "./interfaces";
import { setStateIfMounted } from "./helpers";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const defaultServices = {
  queryTeam: "GET /team",
  loginUser: "POST /user/login",
  inviteUser: "POST /user/invite",
  inviteCollaborator: "POST /user/invite/collaborator",
  getProjects: "GET /projects",
  updateProjectName: "POST /project/uid",
  getProject: "GET /project", // TODO: Support named params for GET? Body works tho...
  getCollectionMembers: "GET /team/collectionmembers",
  createProject: "POST /projects",
  inviteToProject: "POST /projects/invite",
  getCollectionsMembers: "GET /projects/collectionsmembers",
  removeFromProject: "POST /user/delete/collaborator",
  createPlugin: "POST /plugin",
  getPlugins: "GET /plugin",
  deletePlugin: "DELETE /plugin",
  updatePlugin: "PUT /plugin",
  getAnnotationProgress: "GET /progress",
  launchDocs: "GET /docs",
} as Services;

interface Props {
  apiUrl: string;
  services?: Readonly<typeof defaultServices>;
  user?: User; // Optional mock user
  showAppBar: boolean;
  launchCurateCallback?: (projectUid: string) => void;
  launchAuditCallback?: (projectUid: string) => void;
}

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: "white",
    height: "90px !important",
    paddingTop: "9px",
    width: "100% !important",
  },
  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
}));

export function UserInterface(props: Props): JSX.Element {
  const classes = useStyles();
  const [services, setServices] = useState<ServiceFunctions | null>(null);
  const auth = useAuth();

  const isMounted = useRef(false);

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // This loads all the services we use, which are either API requests, or functions that allow us to mock etc.
    const newServices = initApiRequest(props.apiUrl, props.services);
    setStateIfMounted(newServices, setServices, isMounted.current);
  }, [props.apiUrl, props.services, isMounted]);

  useEffect(() => {
    if (!auth) return;
    // Autologin if we've been passed a login
    if (props.user) {
      auth?.saveUser(props.user);
    }
  }, [auth, props.user]);

  if (!auth?.user) return null;

  const appbar = props.showAppBar && (
    <AppBar position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row">
          <Grid item className={classes.logo}>
            <Logo />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );

  return (
    <StylesProvider generateClassName={generateClassName("manage")}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {appbar}
          <div
            style={{
              marginTop: props.showAppBar ? "108px" : "20px",
              display: "flex",
            }}
          >
            <PageSelector user={auth.user} />
            <Routes>
              <Route path="/" element={<Navigate to="projects" />} />

              <Route path="team" element={<TeamView services={services} />} />

              <Route
                path="plugins"
                element={<PluginsView services={services} />}
              />

              <Route
                path="collaborators"
                element={<CollaboratorsView services={services} />}
              />
              <Route
                path="projects"
                element={
                  <ProjectsView
                    services={services}
                    launchCurateCallback={props.launchCurateCallback}
                    launchAuditCallback={props.launchAuditCallback}
                  />
                }
              />
            </Routes>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  );
}

UserInterface.defaultProps = {
  services: defaultServices,
  user: undefined as User,
  launchCurateCallback: undefined,
  launchAuditCallback: undefined,
};

export type { Services };
export { ProvideAuth } from "@/hooks/use-auth";
