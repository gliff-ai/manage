import {
  useState,
  ChangeEvent,
  ReactElement,
  useEffect,
  useCallback,
} from "react";
import {
  Paper,
  Button,
  TextField,
  DialogActions,
  List,
  Chip,
  Checkbox,
  Divider,
  Autocomplete,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import { IconButton, theme, icons, lightGrey, Dialogue } from "@gliff-ai/style";
import { Profile, ProjectDetails, ProjectUser } from "@/interfaces";
import { Notepad } from "@/components";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    justifyContent: "space-between",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "350px",
  },
  confirmButton: {
    textTransform: "none",
    marginTop: "15px !important",
    backgroundColor: `${theme.palette.primary.main} !important`,
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  userInviteTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "8px",
  },
  editProjectSection: {
    margin: "20px 15px 15px",
  },
  editUsersSection: {
    margin: "20px 15px 15px !important",
  },
  listUsersSection: {
    margin: "10px 15px 30px",
  },
  usersList: { padding: 0 },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderRadius: "9px",
    maxWidth: "300px",
    fontSize: "14px",
  },
  currentChip: { borderColor: "black", color: "black" },
  pendingChip: {
    borderColor: "grey",
    color: "grey",
  },
  selectedOptions: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "270px",
    height: "30",
  },
  divider: {
    width: "100% !important",
    margin: "0",
    lineHeight: "1px",
  },
  checkboxIcon: {
    width: "18px",
    height: "auto",
  },
  closeIcon: { width: "15px" },
  option: {
    backgroundColor: `#FFFFFF !important`,
    fontSize: "14px",
    "&:hover": { backgroundColor: `${lightGrey} !important` },
    padding: "5px",
  },
});

interface Props {
  projectUid: string;
  projectDetails: ProjectDetails;
  projectUsers: ProjectUser[];
  invitees: Profile[];
  updateProjectDetails: (data: {
    projectUid: string;
    projectDetails: ProjectDetails;
  }) => Promise<unknown>;
  inviteToProject: (uid: string, email: string) => Promise<void>;
  removeFromProject: (uid: string, email: string) => Promise<void>;
  triggerRefetch: (uid: string) => void;
}

export function EditProjectDialog({
  invitees,
  projectUid,
  inviteToProject,
  removeFromProject,
  updateProjectDetails,
  triggerRefetch,
  projectUsers,
  ...otherProps
}: Props): ReactElement | null {
  const classes = useStyles();
  const [closeDialog, setCloseDialog] = useState<boolean>(false);
  const [selectedInvitees, setSelectedInvitees] = useState<Profile[]>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(
    otherProps.projectDetails
  );

  useEffect(() => {
    if (closeDialog) {
      setCloseDialog(false);
    }
  }, [closeDialog]);

  const alreadyInvited = useCallback(
    (username: string): boolean =>
      projectUsers.filter((user) => user.username === username).length > 0,
    [projectUsers]
  );

  const filterInviteesOptions = ({ email }: Profile): boolean => {
    const user = projectUsers.find(({ username }) => username === email);
    return !user?.isPending && user?.accessLevel !== 1;
  };

  useEffect(() => {
    if (!projectUsers) return;

    setSelectedInvitees(invitees.filter(({ email }) => alreadyInvited(email)));
  }, [projectUsers, invitees, alreadyInvited]);

  if (!invitees || !projectUsers || !selectedInvitees) return null;

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Profile[]
  ): void => {
    setSelectedInvitees(value);
  };

  const changeCollectionMembers = async () => {
    if (!selectedInvitees) return;
    await Promise.all(
      invitees.map(async (profile) => {
        if (
          selectedInvitees.includes(profile) &&
          !alreadyInvited(profile.email)
        ) {
          await inviteToProject(projectUid, profile.email);
        }

        if (
          !selectedInvitees.includes(profile) &&
          alreadyInvited(profile.email) // can only remove users that have already accepted or rejected invite
        ) {
          await removeFromProject(projectUid, profile.email);
        }
        return true;
      })
    );
  };

  const updateProject = async () => {
    await changeCollectionMembers();

    const { name: newName, description: newDescription } = projectDetails;
    const { name, description } = otherProps.projectDetails;

    if (newName !== name || newDescription !== description) {
      await updateProjectDetails({
        projectUid,
        projectDetails,
      });
    }

    triggerRefetch(projectUid);
    setCloseDialog(!closeDialog);
  };

  const getChips = ({ name, username, isPending }: ProjectUser) => (
    <Chip
      key={username}
      className={`${classes.chipLabel} ${
        isPending ? classes.pendingChip : classes.currentChip
      }`}
      label={name}
      variant="outlined"
    />
  );

  const editProjectSection = (
    <Paper elevation={0} square className={classes.editProjectSection}>
      <TextField
        placeholder="Project Name"
        variant="outlined"
        value={projectDetails.name}
        onChange={(event) => {
          setProjectDetails((details) => ({
            ...details,
            name: event.target.value,
          }));
        }}
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
    </Paper>
  );

  const editUsersSection = (
    <Paper elevation={0} square className={classes.editUsersSection}>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        multiple
        disableCloseOnSelect
        disableClearable
        options={invitees}
        value={selectedInvitees}
        onChange={handleSelectChange}
        getOptionLabel={(option: Profile) => option.name}
        filterOptions={(options) => options.filter(filterInviteesOptions)}
        renderOption={(props, option) => (
          <li {...props} className={classes.option}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Checkbox
                icon={
                  <SVG
                    className={classes.checkboxIcon}
                    src={icons.notSelectedTickbox}
                  />
                }
                checkedIcon={
                  <SVG
                    className={classes.checkboxIcon}
                    src={icons.multipleImageSelection}
                  />
                }
                checked={selectedInvitees.includes(option)}
              />
              <div
                style={{
                  display: "flex",
                  marginLeft: "5px",
                  flexWrap: "wrap",
                }}
              >
                {option.name} - {option.email}
              </div>
            </div>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add or Remove Users"
            variant="outlined"
          />
        )}
        renderTags={(selectedOptions) => (
          <p className={classes.selectedOptions}>
            {selectedOptions.map((option) => option.name).join(", ")}
          </p>
        )}
      />
      <DialogActions>
        <Button
          className={classes.confirmButton}
          variant="contained"
          color="primary"
          onClick={updateProject}
        >
          Confirm
        </Button>
      </DialogActions>
    </Paper>
  );

  const listUsersSection = (
    <Paper elevation={0} square className={classes.listUsersSection}>
      <List className={classes.usersList}>{projectUsers.map(getChips)}</List>
    </Paper>
  );

  return (
    <>
      <Dialogue
        title="Edit Project"
        close={closeDialog}
        TriggerButton={
          <IconButton
            id={`edit-project-${projectUid}`}
            data-testid={`edit-${projectUid}`}
            tooltip={{
              name: "Edit Project",
            }}
            icon={icons.edit}
            size="small"
            tooltipPlacement="top"
          />
        }
      >
        <>
          {editProjectSection}
          <Divider className={classes.divider} />
          {editUsersSection}
          <Divider className={classes.divider} />
          {listUsersSection}
        </>
      </Dialogue>
    </>
  );
}
