import { useState, ChangeEvent } from "react";
import {
  Paper,
  Button,
  Card,
  Dialog,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import Autocomplete from "@mui/material/Autocomplete";
import { theme, icons } from "@gliff-ai/style";
import { Profile } from "@/interfaces";

const useStyles = makeStyles(() => ({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    hegith: "400px",
  },
  inviteBtn: {
    marginTop: "15px",
    backgroundColor: theme.palette.primary.main,
    position: "relative",
    left: "68px",
  },

  userInviteTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
  },
  paperBody: {
    margin: "15px",
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
}

export function InviteDialog(props: Props): React.ReactElement {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);

  const inviteSelect = (
    <form noValidate autoComplete="off">
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        options={props.projectInvitees}
        getOptionLabel={(option: Profile) => option.name}
        onChange={props.handleSelectChange}
        renderInput={(params) => (
          <TextField {...params} label="Add Team Member" variant="outlined" />
        )}
        autoSelect
      />
      {/* eslint-enable react/jsx-props-no-spreading */}
      <Button
        className={classes.inviteBtn}
        onClick={() => {
          props.inviteToProject();
          setOpen(false);
        }}
        variant="outlined"
      >
        Invite
      </Button>
    </form>
  );

  return (
    <>
      <IconButton
        data-testid={`edit-${props.projectUid}`}
        onClick={() => setOpen(!open)}
        size="large"
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
              Invite User
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
