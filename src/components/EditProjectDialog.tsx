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
import { Profile, Team } from "@/interfaces";

const useStyles = makeStyles(() => ({
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
    borderColor: "black",
    borderRadius: "9px",
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
}));

interface Props {
  projectUid: string;
  projectMembers: string[];
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

  if (!invitees || projectMembers === undefined) return null;

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Profile[]
  ): void => {
    setSelectedInvitees(value);
  };

  const updateCollectionMembers = () => {
    console.log(selectedInvitees);
    invitees.forEach((profile) => {
      if (
        selectedInvitees.includes(profile) &&
        !projectMembers.includes(profile.email)
      ) {
        void inviteToProject(projectUid, profile.email);
      }

      if (!selectedInvitees.includes(profile)) {
        void removeFromProject(projectUid, profile.email);
      }
    });
    setOpen(false);
  };

  const inviteSelect = (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        multiple
        disableCloseOnSelect
        disableClearable
        defaultValue={invitees.filter(({ email }) =>
          projectMembers.includes(email)
        )}
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
              defaultChecked={projectMembers.includes(option.email)}
            />
            {option.name}
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
        {projectMembers?.map((username) => (
          <Chip
            key={username}
            className={classes.chipLabel}
            label={username}
            variant="outlined"
          />
        ))}
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
