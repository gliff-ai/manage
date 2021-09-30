import { useEffect, useState, ChangeEvent, ReactElement } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  TextField,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Clear, Add } from "@material-ui/icons";
import { theme } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Project, Profile, Team } from "@/interfaces";
import { InviteDialog, LaunchIcon } from "@/components";

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
    cancelButton: {
      textTransform: "none",
    },
    OKButton: {
      "&:hover": {
        backgroundColor: theme.palette.info.main,
      },
    },

    // eslint-disable-next-line mui-unused-classes/unused-classes
    "@global": {
      '.MuiAutocomplete-option[data-focus="true"]': {
        background: "#01dbff",
      },
    },
    tableCell: { padding: "0px 16px 0px 25px", fontSize: "16px" },
  }));

interface Props {
  services: ServiceFunctions;
  launchCurateCallback?: (projectUid: string) => void | null;
  launchAuditCallback?: (projectUid: string) => void | null;
}

export const ProjectsView = (props: Props): ReactElement => {
  const auth = useAuth();
  const [newProjectName, setNewProjectName] = useState<string>(""); // string entered in text field in New Project dialog
  const [projects, setProjects] = useState<Project[]>([]); // all projects
  const [projectInvitee, setInvitee] = useState<string>(""); // currently selected team member (email of) in invite popover
  const [projectInvitees, setInvitees] = useState<Profile[]>([]); // all team members except the logged in user
  const [dialogOpen, setDialogOpen] = useState(false); // New Project dialog
  const [dialogInvitees, setDialogInvitees] = useState<Profile[]>([]); // team members selected in the New Project dialog
  const classes = useStyles()();

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const { value } = event.target;
    setInvitee(value);
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .getProjects(null, auth.user.authToken)
        .then((p: Project[]) => {
          setProjects(p);
        });

      if (auth.user.isOwner) {
        void props.services
          .queryTeam(null, auth.user.authToken)
          .then((team: Team) => {
            const invitees = team.profiles.filter(
              ({ email }) => email !== auth?.user?.email
            );
            setInvitees(invitees);
            if (invitees.length > 0) {
              setInvitee(invitees[0].email);
            }
          });
      }
    }
  }, [auth, props.services]);

  const inviteToProject = (projectId: string, inviteeEmail: string) =>
    props.services
      .inviteToProject({ projectId, email: inviteeEmail })
      .then(() => {
        console.log("invite complete!");
      });

  const createProject = async (): Promise<string> => {
    await props.services.createProject({ name: newProjectName });
    const p = (await props.services.getProjects()) as Project[];
    setProjects(p);
    // TODO: would be nice if services.createProject could return the uid of the new project
    console.log(p);
    return p.find((project) => project.name === newProjectName).uid;
  };

  const project = ({ name, uid }: Project) => (
    <TableRow key={uid}>
      <TableCell className={classes.tableCell}>{name}</TableCell>
      <TableCell className={classes.tableCell} align="right">
        {auth.user.isOwner && (
          <InviteDialog
            projectInvitees={projectInvitees}
            handleSelectChange={handleSelectChange}
            inviteToProject={() => inviteToProject(uid, projectInvitee)}
          />
        )}
        <LaunchIcon
          launchCallback={() => props.launchCurateCallback(uid)}
          tooltip={`Open ${name} in CURATE`}
        />
        {auth.user.isOwner && (
          <LaunchIcon
            launchCallback={() => props.launchAuditCallback(uid)}
            tooltip={`Open ${name} in AUDIT`}
          />
        )}
      </TableCell>
    </TableRow>
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
          <Typography
            className={classes.projectsTopography}
            style={{ marginLeft: "14px" }}
          >
            Projects
          </Typography>
        </Paper>

        <Paper elevation={0} square>
          {auth.user.isOwner && (
            <List style={{ paddingBottom: "0px" }}>
              <ListItem
                divider
                style={{ padding: "0px 0px 0px 10px", cursor: "pointer" }}
                onClick={() => {
                  setDialogOpen(!dialogOpen);
                }}
              >
                <div
                  style={{
                    margin: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Add
                    fontSize="large"
                    style={{ marginRight: "10px", color: "grey" }}
                  />
                  <Typography style={{ color: "grey" }}>
                    Create New Project
                  </Typography>
                </div>
              </ListItem>
            </List>
          )}

          <TableContainer>
            <Table aria-label="simple table">
              <TableBody>{projects.map(project)}</TableBody>
            </Table>
          </TableContainer>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <Card>
              <Paper
                elevation={0}
                variant="outlined"
                square
                className={classes.paperHeader}
              >
                <Typography className={classes.projectsTopography}>
                  New Project
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                square
                style={{ width: "20vw", margin: "20px" }}
              >
                <TextField
                  placeholder="Project Name"
                  style={{ width: "100%" }}
                  onChange={(event) => {
                    setNewProjectName(event.target.value);
                  }}
                />

                {/* eslint-disable react/jsx-props-no-spreading */}
                <Autocomplete
                  options={projectInvitees}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add Team Members"
                      variant="outlined"
                    />
                  )}
                  style={{ marginTop: "26px" }}
                  onChange={(event, value) => {
                    // add the selected user profile to dialogInvitees if it's not already there:
                    setDialogInvitees(
                      dialogInvitees.includes(value as Profile)
                        ? dialogInvitees
                        : dialogInvitees.concat(value as Profile)
                    );
                  }}
                />
                {/* eslint-enable react/jsx-props-no-spreading */}

                <List>
                  {dialogInvitees.map((profile) => (
                    <ListItem key={profile.email}>
                      <ListItemText>{profile.name}</ListItemText>
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => {
                            // remove `email` from dialogInvitees:
                            setDialogInvitees(
                              dialogInvitees.filter(
                                (_profile) => _profile.email !== profile.email
                              )
                            );
                          }}
                        >
                          <Clear />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <DialogActions>
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                    }}
                    className={classes.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={classes.OKButton}
                    variant="contained"
                    color="primary"
                    disabled={
                      newProjectName === "" ||
                      projects.map((p) => p.name).includes(newProjectName)
                    }
                    onClick={() => {
                      createProject().then(
                        (newProjectUid) => {
                          for (const profile of dialogInvitees) {
                            inviteToProject(newProjectUid, profile.email).catch(
                              (err) => {
                                console.log(err);
                              }
                            );
                          }
                        },
                        (err) => {
                          console.log(err);
                        }
                      );
                      setDialogOpen(false);
                    }}
                  >
                    OK
                  </Button>
                </DialogActions>
              </Paper>
            </Card>
          </Dialog>
        </Paper>
      </Card>
    </>
  );
};

ProjectsView.defaultProps = {
  launchCurateCallback: undefined,
  launchAuditCallback: undefined,
};
