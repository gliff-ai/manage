import { useEffect, useState, ReactElement, useRef, useCallback } from "react";
import {
  Paper,
  Box,
  Typography,
  Card,
  makeStyles,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { theme, LoadingSpinner } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Project, Profile, Team, UserAccess, Progress } from "@/interfaces";
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
    backgroundColor: theme.palette.primary.main,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectsTopography: {
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
  tableCell: {
    padding: "0px 16px 0px 25px",
    fontSize: "16px",
    maxHeight: "28px",
    maxWidth: "250px",
  },
  tableHeader: {
    padding: "0px 16px 0px 25px",
    fontSize: "16px",
    maxHeight: "28px",
    fontWeight: 700,
    height: "40px",
  },
});

interface Props {
  services: ServiceFunctions;
  launchCurateCallback?: (projectUid: string) => void | null;
  launchAuditCallback?: (projectUid: string) => void | null;
  getAnnotationProgress: (username: string) => Promise<Progress>;
}

export const ProjectsView = ({
  services,
  getAnnotationProgress,
  launchCurateCallback,
  launchAuditCallback,
}: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null); // all projects
  const [progress, setProgress] = useState<Progress | null>(null);
  const [projectInvitees, setInvitees] = useState<Profile[] | null>(null); // all team members except the logged in user
  const [projectMembers, setProjectMembers] = useState<{
    [uid: string]: string[];
  } | null>({});

  const classes = useStyles();
  const isMounted = useRef(false);

  const isOwnerOrMember = useCallback(
    (): boolean =>
      auth.user.userAccess === UserAccess.Owner ||
      auth.user.userAccess === UserAccess.Member,
    [auth.user.userAccess]
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
    if (!isMounted.current || !auth?.user?.email) return;

    void services
      .getProjects(null, auth.user.authToken)
      .then((p: Project[]) =>
        setStateIfMounted(p, setProjects, isMounted.current)
      );

    if (isOwnerOrMember()) {
      void services.queryTeam(null, auth.user.authToken).then((team: Team) => {
        setStateIfMounted(team.profiles, setInvitees, isMounted.current);
      });
    }
  }, [auth, services, isMounted, isOwnerOrMember]);

  useEffect(() => {
    if (!isMounted?.current || !isOwnerOrMember() || !projectInvitees) return;

    void services.getCollectionsMembers().then((members) => {
      setStateIfMounted(members, setProjectMembers, isMounted.current);
    });
  }, [auth, services, isMounted, projectInvitees, isOwnerOrMember]);

  useEffect(() => {
    if (!isMounted.current || !auth?.user?.email) return;

    void getAnnotationProgress(auth.user.email).then((newProgress) => {
      if (newProgress) {
        setStateIfMounted(newProgress, setProgress, isMounted.current);
      }
    });
  }, [isMounted, auth, getAnnotationProgress]);

  const inviteToProject = async (
    projectId: string,
    inviteeEmail: string
  ): Promise<void> => {
    await services.inviteToProject({ projectId, email: inviteeEmail });

    console.log(`invite complete!: ${inviteeEmail}`);
  };

  const createProject = async (name: string): Promise<string> => {
    await services.createProject({ name });
    const p = (await services.getProjects()) as Project[];
    setProjects(p);
    // TODO: would be nice if services.createProject could return the uid of the new project
    return p?.find((project) => project.name === name).uid;
  };

  const listAssignees = (assignees: string[]): any => (
    <p>
      {assignees.slice(0, 3).join(", ")}
      {assignees.length > 3 && <b> + {assignees.length - 3} others</b>}
    </p>
  );

  if (!auth?.user) return null;

  return (
    <>
      <Card style={{ width: "100%", height: "85vh", marginRight: "20px" }}>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.projectsTopography}>
            Projects
          </Typography>
          {isOwnerOrMember() && projects !== null && (
            <CreateProjectDialog
              projects={projects}
              projectInvitees={projectInvitees}
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
                <TableBody>
                  <TableRow key="tab-header">
                    <TableCell className={classes.tableHeader}>Name</TableCell>
                    {isOwnerOrMember() && (
                      <TableCell className={classes.tableHeader}>
                        Assignees
                      </TableCell>
                    )}
                    <TableCell className={classes.tableHeader}>
                      Annotation Progress
                    </TableCell>
                    <TableCell className={classes.tableHeader} />
                  </TableRow>
                  {projects.map(({ name, uid }) => (
                    <TableRow key={uid}>
                      <TableCell className={classes.tableCell}>
                        {name}
                      </TableCell>
                      {isOwnerOrMember() && (
                        <TableCell className={classes.tableCell}>
                          {projectMembers[uid] !== undefined &&
                            listAssignees(projectMembers[uid])}
                        </TableCell>
                      )}
                      <TableCell className={classes.tableCell}>
                        {progress && <ProgressBar progress={progress[uid]} />}
                      </TableCell>
                      <TableCell className={classes.tableCell} align="right">
                        {isOwnerOrMember() && (
                          <EditProjectDialog
                            projectUid={uid}
                            projectMembers={projectMembers[uid]}
                            projectInvitees={projectInvitees}
                            inviteToProject={inviteToProject}
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
    </>
  );
};

ProjectsView.defaultProps = {
  launchCurateCallback: undefined,
  launchAuditCallback: undefined,
};
