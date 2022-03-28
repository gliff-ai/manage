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
  Card,
  Dialog,
  IconButton,
  Typography,
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
import {
  IconButton as GliffIconButton,
  theme,
  icons,
  lightGrey,
} from "@gliff-ai/style";
import { Profile, ProjectUsers } from "@/interfaces";

const useStyles = makeStyles({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "350px",
  },
  confirmButton: {
    textTransform: "none",
    marginTop: "15px",
    backgroundColor: theme.palette.primary.main,
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
    margin: "20px 15px 15px",
  },
  listUsersSection: {
    margin: "10px 15px 30px",
  },
  usersList: { padding: 0 },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderRadius: "9px",
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
    width: "100%",
    margin: "0",
    lineHeight: "1px",
  },
  checkboxIcon: { width: "18px", height: "auto" },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
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
  projectName: string;
  projectUsers: ProjectUsers;
  invitees: Profile[];
  updateProjectName: (data: {
    projectUid: string;
    projectName: string;
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
  updateProjectName,
  triggerRefetch,
  projectUsers,
  ...otherProps
}: Props): ReactElement | null {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedInvitees, setSelectedInvitees] = useState<Profile[]>(null);
  const [projectName, setProjectName] = useState<string>(
    otherProps.projectName
  );

  const alreadyInvited = useCallback(
    (user: Profile): boolean =>
      projectUsers.usernames.includes(user.email) ||
      projectUsers.pendingUsernames.includes(user.email),
    [projectUsers]
  );

  useEffect(() => {
    if (!projectUsers) return;

    setSelectedInvitees(invitees.filter(alreadyInvited));
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
        if (selectedInvitees.includes(profile) && !alreadyInvited(profile)) {
          await inviteToProject(projectUid, profile.email);
        }

        if (
          !selectedInvitees.includes(profile) &&
          projectUsers.usernames.includes(profile.email) // can only remove users that have already accepted or rejected invite
        ) {
          await removeFromProject(projectUid, profile.email);
        }
        return true;
      })
    );
  };

  const updateProject = async () => {
    await changeCollectionMembers();

    if (projectName !== otherProps.projectName) {
      await updateProjectName({ projectUid, projectName });
    }

    triggerRefetch(projectUid);
    setOpen(false);
  };

  const getChips = (usernames: string[], isPending = false) =>
    usernames.map((username) => (
      <Chip
        key={username}
        className={`${classes.chipLabel} ${
          isPending ? classes.pendingChip : classes.currentChip
        }`}
        label={username}
        variant="outlined"
      />
    ));

  const editProjectSection = (
    <Paper elevation={0} square className={classes.editProjectSection}>
      <TextField
        placeholder="Project Name"
        variant="outlined"
        value={projectName}
        onChange={(event) => {
          setProjectName(event.target.value);
        }}
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
        getOptionLabel={(option) => option.name}
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
                style={{ display: "flex", marginLeft: "5px", flexWrap: "wrap" }}
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
          variant="outlined"
          onClick={updateProject}
        >
          Confirm
        </Button>
      </DialogActions>
    </Paper>
  );

  const listUsersSection = (
    <Paper elevation={0} square className={classes.listUsersSection}>
      <List className={classes.usersList}>
        {getChips(projectUsers.usernames)}
        {getChips(projectUsers.pendingUsernames, true)}
      </List>
    </Paper>
  );

  return (
    <>
      <GliffIconButton
        data-testid={`edit-${projectUid}`}
        onClick={() => setOpen(!open)}
        icon={icons.edit}
        tooltip={{ name: "Edit" }}
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Card className={classes.card}>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.userInviteTopography}>
              Edit Project
            </Typography>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
              size="small"
            >
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          {editProjectSection}
          <Divider className={classes.divider} />
          {editUsersSection}
          <Divider className={classes.divider} />
          {listUsersSection}
        </Card>
      </Dialog>
    </>
  );
}
