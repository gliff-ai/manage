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
import { theme, icons, IconButton as GliffIconButton } from "@gliff-ai/style";
import { Profile, Project } from "@/interfaces";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
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
  },
  iconSize: {
    width: "15px",
  },
  addButton: {
    color: "#000000",
  },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  closeIcon: { width: "15px" },
});

interface Props {
  projects: Project[] | null;
  invitees: Profile[] | null;
  createProject: (name: string) => Promise<string>;
  inviteToProject: (uid: string, email: string) => Promise<void>;
}

export function CreateProjectDialog({
  projects,
  invitees,
  createProject,
  inviteToProject,
}: Props): ReactElement | null {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [dialogInvitees, setDialogInvitees] = useState<Profile[] | null>([]);

  const classes = useStyles();

  if (!invitees || !projects) return null;

  return (
    <>
      <GliffIconButton
        tooltip={{ name: "Add New Project" }}
        icon={icons.add}
        onClick={() => setDialogOpen(true)}
        tooltipPlacement="top"
        size="small"
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
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
            <IconButton
              className={classes.closeButton}
              onClick={() => setDialogOpen(false)}
            >
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper elevation={0} square style={{ width: "20vw", margin: "20px" }}>
            <TextField
              placeholder="Project Name"
              style={{ width: "100%" }}
              onChange={(event) => {
                setNewProjectName(event.target.value);
              }}
              variant="standard"
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
                  label={profile.email}
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
                  newProjectName === "" ||
                  projects.map((p) => p.name).includes(newProjectName)
                }
                onClick={() => {
                  createProject(newProjectName).then(
                    (newProjectUid) => {
                      for (const profile of dialogInvitees) {
                        inviteToProject(newProjectUid, profile.email).catch(
                          (err) => {
                            console.error(err);
                          }
                        );
                      }
                    },
                    (err) => {
                      console.error(err);
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
    </>
  );
}
