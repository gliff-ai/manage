import { useState, ChangeEvent, ReactElement, useEffect } from "react";
import {
  Paper,
  Button,
  Card,
  Dialog,
  IconButton,
  Typography,
  makeStyles,
  TextField,
  DialogActions,
  List,
  Chip,
  Checkbox,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme, icons } from "@gliff-ai/style";
import { Profile } from "@/interfaces";

const useStyles = makeStyles({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    height: "auto",
  },
  inviteBtn: {
    position: "relative",
    marginTop: "15px",
    marginLeft: "100px",
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
  paperBody: {
    margin: "15px",
  },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderRadius: "9px",
  },
  currentChip: { borderColor: "black", color: "black" },
  pendingChip: {
    borderColor: theme.palette.text.hint,
    color: theme.palette.text.hint,
  },
  selectedOptions: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "270px",
    height: "30",
  },
  divider: {
    margin: 0,
    width: "100%",
    height: "1.5px",
  },
  checkboxIcon: { width: "18px", height: "auto" },
});

interface Props {
  projectUid: string;
  projectMembers: { usernames: string[]; pendingUsernames: string[] };
  invitees: Profile[];
  inviteToProject: (projectId: string, inviteeEmail: string) => Promise<void>;
  removeFromProject: (uid: string, username: string) => Promise<void>;
}

export function EditProjectDialog({
  projectUid,
  projectMembers,
  invitees,
  inviteToProject,
  removeFromProject,
}: Props): ReactElement | null {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedInvitees, setSelectedInvitees] =
    useState<Profile[] | null>(null);
  const [invited, setInvited] = useState<string[] | null>(null);

  useEffect(() => {
    if (projectMembers === undefined) return;
    const newInvited = projectMembers.usernames.concat(
      projectMembers.pendingUsernames
    );
    setInvited(newInvited);
  }, [projectMembers]);

  if (!invitees || projectMembers === undefined || !invited) return null;

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Profile[]
  ): void => {
    setSelectedInvitees(value);
  };

  const updateCollectionMembers = () => {
    invitees.forEach((profile) => {
      if (
        selectedInvitees.includes(profile) &&
        !invited.includes(profile.email)
      ) {
        void inviteToProject(projectUid, profile.email);
      }

      if (
        !selectedInvitees.includes(profile) &&
        projectMembers.usernames.includes(profile.email) // can only remove users that have already accepted or rejected invite
      ) {
        void removeFromProject(projectUid, profile.email);
      }
    });

    // trigger re-render
    setOpen(false);
  };

  const getChips = (members: string[], isPending = false) =>
    members.map((username) => (
      <Chip
        key={username}
        className={`${classes.chipLabel} ${
          isPending ? classes.pendingChip : classes.currentChip
        }`}
        label={username}
        variant="outlined"
      />
    ));

  const inviteSelect = (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        multiple
        disableCloseOnSelect
        disableClearable
        defaultValue={invitees.filter(({ email }) => invited.includes(email))}
        options={invitees}
        getOptionLabel={(option: Profile): string => option.name}
        renderOption={(option: Profile, { selected }) => (
          <>
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
              defaultChecked={invited.includes(option.email)}
            />
            {option.name} — {option.email}
          </>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Update Team Members"
            variant="outlined"
          />
        )}
        renderTags={(selectedOptions) => (
          <p className={classes.selectedOptions}>
            {selectedOptions.map((option) => option.name).join(", ")}
          </p>
        )}
        style={{ marginTop: "26px" }}
        onChange={handleSelectChange}
      />
      <DialogActions>
        <Button
          className={classes.inviteBtn}
          variant="contained"
          color="primary"
          onClick={updateCollectionMembers}
        >
          OK
        </Button>
      </DialogActions>
      <br />
      <List>
        {getChips(projectMembers.usernames)}
        {getChips(projectMembers.pendingUsernames, true)}
      </List>
    </>
  );

  return (
    <>
      <IconButton
        data-testid={`edit-${projectUid}`}
        onClick={() => setOpen(!open)}
      >
        <SVG src={icons.edit} style={{ width: "22px", height: "auto" }} />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
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
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {inviteSelect}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
