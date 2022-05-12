import { useState, ReactElement } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  List,
  Chip,
  Avatar,
  Dialog,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import {
  theme,
  icons,
  lightGrey,
  IconButton as GliffIconButton,
} from "@gliff-ai/style";
import { Profile, Project, ProjectDetails } from "@/interfaces";
import { Notepad } from "@/components";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    justifyContent: "space-between",
  },
  projectsTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "8px",
  },
  cancelButton: {
    textTransform: "none",
  },
  OKButton: {
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderColor: "black",
    borderRadius: "9px",
    maxWidth: "300px",
    fontSize: "14px",
  },
  iconSize: {
    width: "15px",
  },
  addButton: {
    color: "#000000",
  },
  closeIcon: { width: "15px" },
  option: {
    backgroundColor: `#FFFFFF !important`,
    fontSize: "14px",
    "&:hover": { backgroundColor: `${lightGrey} !important` },
    padding: "5px 10px",
  },
});

interface Props {
  projects: Project[] | null;
  invitees: Profile[] | null;
  createProject: (projectDetails: ProjectDetails) => Promise<string>;
  inviteToProject: (uid: string, email: string) => Promise<void>;
}

const INITIAL_PROJECT_DETAILS: ProjectDetails = { name: "", description: "" };

export function CreateProjectDialog({
  projects,
  invitees,
  createProject,
  inviteToProject,
}: Props): ReactElement | null {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(
    INITIAL_PROJECT_DETAILS
  );
  const [dialogInvitees, setDialogInvitees] = useState<Profile[] | null>([]);

  const classes = useStyles();

  const closeDialog = (): void => {
    setDialogOpen(false);
    setProjectDetails(INITIAL_PROJECT_DETAILS);
  };

  if (!invitees || !projects) return null;

  return (
    <>
      <GliffIconButton
        id="create-project"
        tooltip={{ name: "Add New Project" }}
        icon={icons.add}
        onClick={() => setDialogOpen(true)}
        tooltipPlacement="top"
      />
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <Card>
          <Paper
            className={classes.paperHeader}
            elevation={0}
            variant="outlined"
            square
          >
            <Typography className={classes.projectsTopography}>
              Create Project
            </Typography>
            <IconButton onClick={closeDialog}>
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper
            elevation={0}
            square
            style={{ width: "350px", margin: "20px" }}
          >
            <TextField
              placeholder="Project Name"
              style={{ width: "100%" }}
              onChange={(event) => {
                setProjectDetails((details) => ({
                  ...details,
                  name: event.target.value,
                }));
              }}
              variant="standard"
            />
            <br />
            <Notepad
              placeholder="Project Description (Optional)"
              value={projectDetails.description}
              onChange={(event) => {
                setProjectDetails((details) => ({
                  ...details,
                  description: event.target.value,
                }));
              }}
              rows={6}
            />
            {/* eslint-disable react/jsx-props-no-spreading */}
            <Autocomplete
              options={invitees}
              getOptionLabel={(option) => `${option.name} — ${option.email}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Team Members"
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} className={classes.option}>
                  {option.name} — {option.email}
                </li>
              )}
              style={{ marginTop: "26px" }}
              onChange={(event, value) => {
                // add the selected user profile to dialogInvitees if it's not already there:
                if (!value) return;
                setDialogInvitees(
                  dialogInvitees.includes(value as Profile)
                    ? dialogInvitees
                    : dialogInvitees.concat(value as Profile)
                );
              }}
            />
            <List>
              {dialogInvitees?.map((profile) => (
                <Chip
                  key={profile.email}
                  avatar={
                    <Avatar
                      variant="circular"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // remove `email` from dialogInvitees:
                        setDialogInvitees(
                          dialogInvitees.filter(
                            (_profile) => _profile.email !== profile.email
                          )
                        );
                      }}
                    >
                      <SVG
                        className={classes.iconSize}
                        src={icons.removeLabel}
                        fill="inherit"
                      />
                    </Avatar>
                  }
                  className={classes.chipLabel}
                  label={profile.name}
                  variant="outlined"
                />
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
                  projectDetails.name === "" ||
                  projects.map((p) => p.name).includes(projectDetails.name)
                }
                onClick={() => {
                  createProject(projectDetails).then(
                    (newProjectUid) => {
                      const invites = new Set<string>();
                      // Always invite the team owner
                      for (const member of invitees) {
                        if (member.is_owner) invites.add(member.email);
                      }

                      for (const profile of dialogInvitees) {
                        if (!profile.is_owner) invites.add(profile.email);
                      }

                      for (const invitee of invites) {
                        inviteToProject(newProjectUid, invitee).catch((err) =>
                          console.error(err)
                        );
                      }
                    },
                    (err) => {
                      console.error(err);
                    }
                  );
                  closeDialog();
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
