import {
  useEffect,
  useState,
  ReactElement,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Paper,
  Box,
  Typography,
  Card,
  DialogActions,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  theme,
  IconButton,
  LoadingSpinner,
  icons,
  lightGrey,
} from "@gliff-ai/style";
import SVG from "react-inlinesvg";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Project,
  Profile,
  UserAccess,
  Progress,
  ProjectUsers,
  ProjectUser,
  Team,
} from "@/interfaces";
import {
  EditProjectDialog,
  CreateProjectDialog,
  ProgressBar,
  Table,
  TableCell,
  TableRow,
  TableButtonsCell,
} from "@/components";

const useStyles = makeStyles({
  paperHeader: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "50px",
  },
  topography: {
    color: "#000000",
    fontSize: "21px",
    marginLeft: "20px !important",
  },
  // eslint-disable-next-line mui-unused-classes/unused-classes
  "@global": {
    '.MuiAutocomplete-option[data-focus="true"]': {
      background: "#01dbff",
    },
  },
  whiteButton: {
    textTransform: "none",
    backgroundColor: "transparent",
    borderColor: `${lightGrey} !important`,
    "&:hover": {
      borderColor: lightGrey,
    },
  },
  greenButton: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    "&:disabled": {
      backgroundColor: lightGrey,
    },
    textTransform: "none",
    "&:hover": {
      backgroundColor: `${theme.palette.info.main} !important`,
    },
  },
  cardTitle: { fontSize: "18px", fontWeight: 700 },
  cardSubtitle: { fontSize: "16px" },
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
  const [createProjectIsOpen, setCreateProjectIsOpen] =
    useState<boolean | null>(null);

  const classes = useStyles();
  const isMounted = useRef(false);

  const isOwnerOrMember = useMemo(
    (): boolean =>
      auth.user.userAccess === UserAccess.Owner ||
      auth.user.userAccess === UserAccess.Member,
    [auth.user.userAccess]
  );

  const isTrustedServices = (email: string): boolean =>
    email.includes("trustedservice");

  const updateProjectUsers = useCallback(
    (projectUid: string): void => {
      void services
        .getCollectionMembers({ collectionUid: projectUid })
        .then((newUsers: ProjectUser[]) => {
          if (newUsers && isMounted.current) {
            setProjectUsers((prevUsers) => {
              const newProjectsUsers = { ...prevUsers };

              newProjectsUsers[projectUid] = newUsers
                .filter(({ username }) => !isTrustedServices(username))
                .map((user) => ({
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

  const deleteProject = (projectUid: string) => () =>
    services
      .deleteProject({ projectUid })
      .then((isDeleted) => {
        if (isDeleted) {
          // remove deleted project from the list
          setProjects((prevProjects) =>
            prevProjects.filter((p) => p.uid !== projectUid)
          );

          console.log(`project ${projectUid} was successfully deleted!`);
        }
      })
      .catch((e) => console.error(e));

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

  const introToManageCard = useMemo(
    () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          variant="outlined"
          raised={false}
          style={{
            width: "500px",
            height: "auto",
            border: `3px solid ${lightGrey}`,
            borderRadius: "9px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <SVG
            src={icons.projectsPage}
            style={{ width: "auto", height: "40px", marginBottom: "20px" }}
          />
          <span className={classes.cardTitle}>
            {isOwnerOrMember
              ? "You currently have no projects!"
              : "You aren't assigned to any projects!"}
          </span>
          <span className={classes.cardSubtitle}>
            {isOwnerOrMember
              ? "Create a project or try our demo project to get started."
              : "Contact your team owner to be assigned to a project."}
          </span>
          {isOwnerOrMember && (
            <DialogActions
              style={{
                marginTop: "20px",
                width: "340px",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="outlined"
                className={classes.whiteButton}
                onClick={() => services.downloadDemoData()}
              >
                Open Demo Project
              </Button>
              <Button
                variant="outlined"
                className={classes.greenButton}
                onClick={() => setCreateProjectIsOpen(true)}
              >
                Open New Project
              </Button>
            </DialogActions>
          )}
        </Card>
      </div>
    ),
    [isOwnerOrMember]
  );

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // fetch projects (should run once at mount)
    if (!auth?.user?.authToken) return;

    void services.getProjects(null, auth.user.authToken).then(setProjects);
  }, [services, auth?.user?.authToken]);

  useEffect(() => {
    // fetch project users (should run once at mount)
    if (!isOwnerOrMember || !invitees) return;

    void services.getCollectionsMembers().then((newUsers: ProjectUsers) => {
      if (newUsers) {
        // add users' names
        for (const key of Object.keys(newUsers)) {
          newUsers[key] = newUsers[key]
            .filter(({ username }) => !isTrustedServices(username))
            .map((user) => ({
              name: invitees.find(({ email }) => email === user.username).name,
              ...user,
            }));
        }
        setProjectUsers(newUsers);
      }
    });
  }, [services, isOwnerOrMember, invitees]);

  useEffect(() => {
    // fetch team members (should run once at mount)
    if (!auth?.user?.authToken || !isOwnerOrMember) return;

    void services
      .queryTeam(null, auth.user.authToken)
      .then(({ profiles, owner }: Team) => {
        const p = profiles
          .map((profile) => {
            if (owner.email === profile.email) {
              profile.is_owner = true;
            }

            return profile;
          })
          .filter(({ email }) => !isTrustedServices(email));
        setInvitees(p);
      });
  }, [auth?.user?.authToken, services, isOwnerOrMember]);

  useEffect(() => {
    // fetch annotation progress (should run once at mount)
    if (!auth?.user?.email) return;

    void services
      .getAnnotationProgress({ username: auth.user.email })
      .then(setProgress);
  }, [services, auth?.user?.email]);

  useEffect(() => {
    // if the user is new to manage, the button that opens the create-project dialog
    // is added to the intro-to-manage card, otherwise to the projects table.
    setCreateProjectIsOpen(projects?.length === 0 ? false : null);
  }, [projects]);

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
        {isOwnerOrMember && (
          <CreateProjectDialog
            projects={projects}
            invitees={invitees}
            createProject={createProject}
            inviteToProject={inviteToProject}
            isOpen={createProjectIsOpen}
          />
        )}
      </Paper>
      <Paper elevation={0} style={{ height: "100%" }}>
        {projects === null && (
          <Box display="flex" height="100%">
            <LoadingSpinner />
          </Box>
        )}
        {projects?.length === 0 && introToManageCard}
        {projects?.length > 0 && (
          <Table
            header={
              isOwnerOrMember
                ? ["Name", "Assignees", "Annotation Progress"]
                : ["Name", "Annotation Progress"]
            }
          >
            {projects.map(({ name, uid }) => (
              <TableRow key={uid}>
                <TableCell>{name}</TableCell>
                {isOwnerOrMember && (
                  <TableCell>{listAssignees(uid, projectUsers)}</TableCell>
                )}
                <TableCell>
                  {progress && <ProgressBar progress={progress[uid]} />}
                </TableCell>
                <TableButtonsCell>
                  {isOwnerOrMember &&
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
                  {isOwnerOrMember &&
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
                  {isOwnerOrMember && (
                    <IconButton
                      data-testid={`delete-${uid}`}
                      tooltip={{ name: `Delete ${uid}` }}
                      icon={icons.delete}
                      onClick={deleteProject(uid)}
                      tooltipPlacement="top"
                    />
                  )}
                </TableButtonsCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Paper>
    </Card>
  );
};

ProjectsView.defaultProps = {
  launchCurateCallback: undefined,
  launchAuditCallback: undefined,
};
