import { useState, ChangeEvent, ReactElement } from "react";
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
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme, icons } from "@gliff-ai/style";
import { Profile } from "@/interfaces";

const useStyles = makeStyles(() => ({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    hegith: "400px",
  },
  inviteBtn: {
    position: "relative",
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
}));

interface Props {
  projectUid: string;
  projectInvitees: Profile[];
  handleSelectChange: (
    event: ChangeEvent<HTMLSelectElement>,
    value: Profile
  ) => void;
  inviteToProject: () => void;
  projectMembers: string[];
}

export function InviteDialog(props: Props): ReactElement | null {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);

  if (!props.projectInvitees) return null;

  const getOptions = () =>
    props.projectMembers === undefined
      ? props.projectInvitees
      : props.projectInvitees.filter(
          ({ email }) => !props.projectMembers.includes(email)
        );

  const inviteSelect = (
    <form noValidate autoComplete="off">
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        options={getOptions()}
        getOptionLabel={(option: Profile) => option.name}
        onChange={props.handleSelectChange}
        renderInput={(params) => (
          <TextField {...params} label="Add Team Member" variant="outlined" />
        )}
        autoSelect
      />
      <List>
        {props.projectMembers?.map((username) => (
          <Chip
            key={username}
            className={classes.chipLabel}
            label={username}
            variant="outlined"
          />
        ))}
      </List>
      {/* eslint-enable react/jsx-props-no-spreading */}
      <DialogActions>
        <Button
          className={classes.inviteBtn}
          variant="contained"
          color="primary"
          onClick={() => {
            props.inviteToProject();
            setOpen(false);
          }}
        >
          Invite
        </Button>
      </DialogActions>
    </form>
  );

  return (
    <>
      <IconButton
        data-testid={`edit-${props.projectUid}`}
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
