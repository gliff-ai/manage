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
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { theme, LoadingSpinner } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Project,
  Profile,
  Team,
  UserAccess,
  Progress,
  ProjectsUsers,
} from "@/interfaces";
import {
  EditProjectDialog,
  LaunchIcon,
  CreateProjectDialog,
  ProgressBar,
} from "@/components";
import { setStateIfMounted } from "@/helpers";

const useStyles = makeStyles({
  paperHeader: {
    padding: "2px",
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topography: {
    color: "#000000",
    fontSize: "21px",
    marginLeft: "20px",
  },
  // eslint-disable-next-line mui-unused-classes/unused-classes
  "@global": {
    '.MuiAutocomplete-option[data-focus="true"]': {
      background: "#01dbff",
    },
  },
});

interface Props {
  services: ServiceFunctions;
  launchCurateCallback?: (projectUid: string) => void | null;
  launchAuditCallback?: (projectUid: string) => void | null;
  getAnnotationProgress: (
    username: string,
    projectId?: string
  ) => Promise<Progress>;
}

export const ProjectsView = ({
  services,
  getAnnotationProgress,
  launchCurateCallback,
  launchAuditCallback,
}: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null); // all projects
  const [progress, setProgress] = useState<Progress | null>(null); // progress for each project
  const [invitees, setInvitees] = useState<Profile[] | null>(null); // all team users
  const [projectUsers, setProjectUsers] = useState<ProjectsUsers | null>(null); // users in each project

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
        .then(
          (newUsers: { usernames: string[]; pendingUsernames: string[] }) => {
            if (newUsers && isMounted.current) {
              setProjectUsers((users) => {
                const newProjectsUsers = { ...users };
                newProjectsUsers[projectUid] = newUsers;
                return newProjectsUsers;
              });
            }
          }
        );
    },
    [services, isMounted]
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
    (projectId: string): void => {
      if (!auth?.user?.email) return;

      void getAnnotationProgress(auth.user.email, projectId).then(
        (newProgress) => {
          if (newProgress && isMounted.current) {
            setProgress((p) => ({ ...p, ...newProgress }));
          }
        }
      );
    },
    [getAnnotationProgress, isMounted, auth]
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
    if (!isMounted?.current || !isOwnerOrMember()) return;
    void services.getCollectionsMembers().then((newUsers) => {
      if (newUsers) {
        setStateIfMounted(newUsers, setProjectUsers, isMounted.current);
      }
    });
  }, [isMounted, services, isOwnerOrMember]);

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

    void getAnnotationProgress(auth.user.email).then((newProgress) => {
      if (newProgress) {
        setStateIfMounted(newProgress, setProgress, isMounted.current);
      }
    });
  }, [isMounted, auth, getAnnotationProgress]);

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
    users: ProjectsUsers,
    uid: string
  ): ReactElement | null => {
    if (!users || users[uid] === undefined) return null;

    const assignees = users[uid].usernames;
    return (
      <p>
        {assignees.slice(0, 3).join(", ")}
        {assignees.length > 3 && <b> + {assignees.length - 3} others</b>}
      </p>
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
        {isOwnerOrMember() && projects !== null && (
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
            <Table aria-label="simple table">
              <TableHead>
                <TableRow key="tab-header">
                  <TableCell>Name</TableCell>
                  {isOwnerOrMember() && <TableCell>Assignees</TableCell>}
                  <TableCell>Annotation Progress</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {projects.map(({ name, uid }) => (
                  <TableRow key={uid}>
                    <TableCell>{name}</TableCell>
                    {isOwnerOrMember() && (
                      <TableCell>{listAssignees(projectUsers, uid)}</TableCell>
                    )}
                    <TableCell>
                      {progress && <ProgressBar progress={progress[uid]} />}
                    </TableCell>
                    <TableCell align="right">
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
                      <LaunchIcon
                        launchCallback={() => launchCurateCallback(uid)}
                        tooltip={`Open ${name} in CURATE`}
                      />
                      {isOwnerOrMember() &&
                        auth.user.tierID > 1 &&
                        launchAuditCallback !== null && (
                          <LaunchIcon
                            data-testid={`audit-${uid}`}
                            launchCallback={() => launchAuditCallback(uid)}
                            tooltip={`Open ${name} in AUDIT`}
                          />
                        )}
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
