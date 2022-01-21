import { useState, ReactElement } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import Autocomplete from "@mui/material/Autocomplete";
import { Clear, Add } from "@mui/icons-material";
import { theme } from "@gliff-ai/style";
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
  tableCell: {
    padding: "0px 16px 0px 25px",
    fontSize: "16px",
    maxHeight: "28px",
  },
});

interface Props {
  projects: Project[] | null;
  projectInvitees: Profile[] | null;
  createProject: (newName: string) => Promise<string>;
  inviteToProject: (projectId: string, inviteeEmail: string) => Promise<void>;
}

export function CreateProjectDialog({
  projects,
  projectInvitees,
  createProject,
  inviteToProject,
}: Props): ReactElement {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [dialogInvitees, setDialogInvitees] = useState<Profile[] | null>([]);

  const classes = useStyles();
  return (
    <>
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
            <Add style={{ marginRight: "10px", color: "grey" }} />
            <Typography style={{ color: "grey" }}>
              Create New Project
            </Typography>
          </div>
        </ListItem>
      </List>
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
