import { useEffect, useState, ReactElement, useRef, useCallback } from "react";
import {
  Paper,
  Box,
  Typography,
  Card,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  ButtonGroup,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { theme, IconButton, LoadingSpinner, icons } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Project,
  Profile,
  Team,
  UserAccess,
  Progress,
  ProjectUsers,
  ProjectUser,
} from "@/interfaces";
import {
  EditProjectDialog,
  CreateProjectDialog,
  ProgressBar,
} from "@/components";
import { setStateIfMounted } from "@/helpers";

const useStyles = makeStyles({
  paperHeader: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topography: {
    color: "#000000",
    fontSize: "21px",
    marginLeft: "20px",
  },
  tableText: {
    fontSize: "16px",
    paddingLeft: "20px",
    margin: 0,
    maxWidth: "unset",
  },
  // eslint-disable-next-line mui-unused-classes/unused-classes
  "@global": {
    '.MuiAutocomplete-option[data-focus="true"]': {
      background: "#01dbff",
    },
  },
  buttonGroup: {
    backgroundColor: "transparent !important",
    border: "none !important",
  },
});

interface Props {
  services: ServiceFunctions;
  launchCurateCallback?: (projectUid: string) => void | null;
  launchAuditCallback?: (projectUid: string) => void | null;
}

export const ProjectsView = ({
  services,
  launchCurateCallback,
  launchAuditCallback,
}: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null); // all projects
  const [progress, setProgress] = useState<Progress | null>(null); // progress for each project
  const [invitees, setInvitees] = useState<Profile[] | null>(null); // all team users
  const [projectUsers, setProjectUsers] = useState<ProjectUsers | null>(null); // users in each project

  const classes = useStyles();
  const isMounted = useRef(false);

  const isOwnerOrMember = useCallback(
    (): boolean =>
      auth.user.userAccess === UserAccess.Owner ||
      auth.user.userAccess === UserAccess.Member,
    [auth.user.userAccess]
  );

  const updateProjectUsers = useCallback(
    (projectUid: string): void => {
      void services
        .getCollectionMembers({ collectionUid: projectUid })
        .then((newUsers: ProjectUser[]) => {
          if (newUsers && isMounted.current) {
            setProjectUsers((prevUsers) => {
              const newProjectsUsers = { ...prevUsers };

              newProjectsUsers[projectUid] = newUsers.map((user) => ({
                name: invitees.find(({ email }) => email === user.username)
                  .name,
                ...user,
              }));
              return newProjectsUsers;
            });
          }
        });
    },
    [services, isMounted, invitees]
  );

  const updateProject = useCallback(
    (projectUid: string) => {
      void services.getProject({ projectUid }).then((newProject: Project) => {
        if (isMounted.current) {
          setProjects((prevProjects: Project[]) =>
            prevProjects.map((p) => (p.uid === newProject.uid ? newProject : p))
          );
        }
      });
    },
    [services, isMounted]
  );

  const updateAnnotationProgress = useCallback(
    (projectUid: string): void => {
      if (!auth?.user?.email) return;

      void services
        .getAnnotationProgress({ username: auth.user.email, projectUid })
        .then((newProgress: Progress) => {
          if (newProgress && isMounted.current) {
            setProgress((p) => ({ ...p, ...newProgress }));
          }
        });
    },
    [services, isMounted, auth]
  );

  const triggerRefetch = (projectId: string) => {
    updateProject(projectId);
    updateProjectUsers(projectId);
    updateAnnotationProgress(projectId);
  };

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted?.current || !isOwnerOrMember() || !invitees) return;
    void services.getCollectionsMembers().then((newUsers: ProjectUsers) => {
      if (newUsers) {
        // add users' names
        for (const key of Object.keys(newUsers)) {
          newUsers[key] = newUsers[key].map((user) => ({
            name: invitees.find(({ email }) => email === user.username).name,
            ...user,
          }));
        }

        setStateIfMounted(newUsers, setProjectUsers, isMounted.current);
      }
    });
  }, [isMounted, services, isOwnerOrMember, invitees]);

  useEffect(() => {
    if (!isMounted.current || !auth?.user || !isOwnerOrMember()) return;

    void services
      .queryTeam(null, auth.user.authToken)
      .then(({ profiles }: Team) => {
        setStateIfMounted(profiles, setInvitees, isMounted.current);
      });
  }, [auth, services, isMounted, isOwnerOrMember]);

  useEffect(() => {
    if (!isMounted.current || !auth?.user?.email) return;

    void services
      .getProjects(null, auth.user.authToken)
      .then((p: Project[]) =>
        setStateIfMounted(p, setProjects, isMounted.current)
      );
  }, [auth, services, isMounted]);

  useEffect(() => {
    if (!isMounted.current || !auth?.user?.email) return;

    void services
      .getAnnotationProgress({ username: auth.user.email })
      .then((newProgress) => {
        if (newProgress) {
          setStateIfMounted(newProgress, setProgress, isMounted.current);
        }
      });
  }, [isMounted, auth, services]);

  const inviteToProject = async (
    projectUid: string,
    email: string
  ): Promise<void> => {
    await services.inviteToProject({ projectUid, email });

    console.log(`${email} invited to project ${projectUid}`);
  };

  const removeFromProject = async (
    projectUid: string,
    email: string
  ): Promise<void> => {
    await services.removeFromProject({ projectUid, email });

    console.log(`${email} removed from project ${projectUid}.`);
  };

  const createProject = async (name: string): Promise<string> => {
    const projectId = (await services.createProject({
      name,
    })) as string;
    const p = (await services.getProjects()) as Project[];
    setProjects(p);

    triggerRefetch(projectId);

    return projectId;
  };

  const listAssignees = (
    projectUid: string,
    users: ProjectUsers
  ): ReactElement | null => {
    if (!users || users[projectUid] === undefined) return null;

    const assignees = users[projectUid].map(({ name }) => name);
    return (
      <span>
        {assignees.slice(0, 3).join(", ")}
        {assignees.length > 3 && <b> + {assignees.length - 3} others</b>}
      </span>
    );
  };

  if (!auth?.user) return null;

  return (
    <Card style={{ width: "100%", height: "85vh", marginRight: "20px" }}>
      <Paper
        elevation={0}
        variant="outlined"
        square
        className={classes.paperHeader}
      >
        <Typography className={classes.topography}>Projects</Typography>
        {isOwnerOrMember() && (
          <CreateProjectDialog
            projects={projects}
            invitees={invitees}
            createProject={createProject}
            inviteToProject={inviteToProject}
          />
        )}
      </Paper>
      <Paper elevation={0} square style={{ height: "100%" }}>
        {projects === null ? (
          <Box display="flex" height="100%">
            <LoadingSpinner />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableText}>Name</TableCell>
                  {isOwnerOrMember() && (
                    <TableCell className={classes.tableText}>
                      Assignees
                    </TableCell>
                  )}
                  <TableCell className={classes.tableText}>
                    Annotation Progress
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {projects.map(({ name, uid }) => (
                  <TableRow key={uid}>
                    <TableCell className={classes.tableText}>{name}</TableCell>
                    {isOwnerOrMember() && (
                      <TableCell className={classes.tableText}>
                        {listAssignees(uid, projectUsers)}
                      </TableCell>
                    )}
                    <TableCell className={classes.tableText}>
                      {progress && <ProgressBar progress={progress[uid]} />}
                    </TableCell>
                    <TableCell className={classes.tableText} align="right">
                      <ButtonGroup
                        className={classes.buttonGroup}
                        orientation="horizontal"
                        variant="outlined"
                      >
                        {isOwnerOrMember() &&
                          projectUsers &&
                          projectUsers[uid] !== undefined && (
                            <EditProjectDialog
                              projectUid={uid}
                              projectName={name}
                              projectUsers={projectUsers[uid]}
                              invitees={invitees}
                              updateProjectName={services.updateProjectName}
                              inviteToProject={inviteToProject}
                              removeFromProject={removeFromProject}
                              triggerRefetch={triggerRefetch}
                            />
                          )}
                        <IconButton
                          icon={icons.navigationCURATE}
                          tooltip={{ name: "Open in CURATE" }}
                          onClick={() => launchCurateCallback(uid)}
                          tooltipPlacement="top"
                        />
                        {isOwnerOrMember() &&
                          auth.user.tierID > 1 &&
                          launchAuditCallback !== null && (
                            <IconButton
                              data-testid={`audit-${uid}`}
                              tooltip={{ name: "Open in AUDIT" }}
                              icon={icons.navigationAUDIT}
                              onClick={() => launchAuditCallback(uid)}
                              tooltipPlacement="top"
                            />
                          )}
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Card>
  );
};

ProjectsView.defaultProps = {
  launchCurateCallback: undefined,
  launchAuditCallback: undefined,
};
