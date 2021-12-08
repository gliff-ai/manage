import {
  useEffect,
  useState,
  ChangeEvent,
  ReactElement,
  useRef,
  useCallback,
} from "react";
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
import { Project, Profile, Team, UserAccess } from "@/interfaces";
import { InviteDialog, LaunchIcon, CreateProjectDialog } from "@/components";
import { setStateIfMounted } from "@/helpers";

const useStyles = () =>
  makeStyles(() => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
    projectsTopography: {
      color: "#000000",
      display: "inline",
      fontSize: "21px",
      marginRight: "125px",
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
    },
  }));

interface Props {
  services: ServiceFunctions;
  launchCurateCallback?: (projectUid: string) => void | null;
  launchAuditCallback?: (projectUid: string) => void | null;
}

export const ProjectsView = (props: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null); // all projects
  const [projectInvitee, setInvitee] = useState<string>(""); // currently selected team member (email of) in invite popover
  const [projectInvitees, setInvitees] = useState<Profile[] | null>(null); // all team members except the logged in user

  const classes = useStyles()();
  const isMounted = useRef(false);

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Profile
  ): void => {
    setInvitee(value.email);
  };

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
    if (!auth?.user?.email) return;

    void props.services
      .getProjects(null, auth.user.authToken)
      .then((p: Project[]) =>
        setStateIfMounted(p, setProjects, isMounted.current)
      );

    if (isOwnerOrMember()) {
      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((team: Team) => {
          const invitees = team.profiles.filter(
            ({ email }) => email !== auth?.user?.email
          );
          setStateIfMounted(invitees, setInvitees, isMounted.current);
          if (invitees.length > 0) {
            setStateIfMounted(invitees[0].email, setInvitee, isMounted.current);
          }
        });
    }
  }, [auth, props.services, isMounted, isOwnerOrMember]);

  const inviteToProject = async (
    projectId: string,
    inviteeEmail: string
  ): Promise<void> => {
    await props.services.inviteToProject({ projectId, email: inviteeEmail });

    console.log(`invite complete!: ${inviteeEmail}`);
  };

  const createProject = async (name: string): Promise<string> => {
    await props.services.createProject({ name });
    const p = (await props.services.getProjects()) as Project[];
    setProjects(p);
    // TODO: would be nice if services.createProject could return the uid of the new project
    return p?.find((project) => project.name === name).uid;
  };

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
          <Typography
            className={classes.projectsTopography}
            style={{ marginLeft: "14px" }}
          >
            Projects
          </Typography>
        </Paper>
        <Paper elevation={0} square style={{ height: "100%" }}>
          {isOwnerOrMember() && projects !== null && (
            <CreateProjectDialog
              projects={projects}
              projectInvitees={projectInvitees}
              createProject={createProject}
              inviteToProject={inviteToProject}
            />
          )}
          {projects === null ? (
            <Box display="flex" height="100%">
              <LoadingSpinner />
            </Box>
          ) : (
            <TableContainer>
              <Table aria-label="simple table">
                <TableBody>
                  {projects.map(({ name, uid }: Project) => (
                    <TableRow key={uid}>
                      <TableCell className={classes.tableCell}>
                        {name}
                      </TableCell>
                      <TableCell className={classes.tableCell} align="right">
                        {isOwnerOrMember() && (
                          <InviteDialog
                            projectUid={uid}
                            projectInvitees={projectInvitees}
                            handleSelectChange={handleSelectChange}
                            inviteToProject={() =>
                              inviteToProject(uid, projectInvitee)
                            }
                          />
                        )}
                        <LaunchIcon
                          launchCallback={() => props.launchCurateCallback(uid)}
                          tooltip={`Open ${name} in CURATE`}
                        />
                        {isOwnerOrMember() &&
                          auth.user.tierID > 1 &&
                          props.launchAuditCallback !== null && (
                            <LaunchIcon
                              data-testid={`audit-${uid}`}
                              launchCallback={() =>
                                props.launchAuditCallback(uid)
                              }
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
