import { useState, ReactElement, useEffect } from "react";
import {
  Paper,
  Typography,
  Card,
  List,
  Chip,
  Avatar,
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
  IconButton,
  Dialog,
  Box,
} from "@gliff-ai/style";
import { Profile, Project, ProjectDetails } from "@/interfaces";
import { Notepad } from "@/components";

const chip = {
    borderColor: "black",
    maxWidth: "300px",
    fontSize: "14px",
}

const useStyles = makeStyles({

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
  isOpen?: boolean; // if isOpen !== null, the dialog is controlled externally and the create-project button is not displayed
}

const INITIAL_PROJECT_DETAILS: ProjectDetails = { name: "", description: "" };

export function CreateProjectDialog({
  projects,
  invitees,
  createProject,
  inviteToProject,
  isOpen,
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

  useEffect(() => {
    if (isOpen !== null) setDialogOpen(isOpen);
  }, [isOpen]);

  if (!invitees || !projects) return null;

  return (
    <>
      {isOpen === null && (
        <Dialog
          title="Add Plug-in"
          close={closeDialog}
          TriggerButton={
            <IconButton
              tooltip={{
                name: "Add New Project",
              }}
              tooltipPlacement="top"
              icon={icons.add}
              size="small"
              id="add-plugin"
            />
          }
        >
          <Box>
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
              getOptionLabel={(option: Profile) =>
                `${option.name} — ${option.email}`
              }
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
                        src={icons.removeLabel}
                        fill="inherit"
                        width= "15px"
                      />
                    </Avatar>
                  }
                  label={profile.name}
                  variant="outlined"
                  sx={{...chip}}
                />
              ))}
            </List>
            <DialogActions>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                }}
                variant="outlined"
                color="secondary"
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
          </Box>
        </Dialog>
      )}
    </>
  );
}

CreateProjectDialog.defaultProps = { isOpen: null };
