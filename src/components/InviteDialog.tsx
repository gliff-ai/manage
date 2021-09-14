import { useState, ChangeEvent } from "react";
import {
  Paper,
  Button,
  Card,
  Dialog,
  IconButton,
  Typography,
  makeStyles,
  TextField,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme } from "@gliff-ai/style";
import { imgSrc } from "@/helpers";
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
  projectInvitees: Profile[];
  handleSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
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
        getOptionLabel={(option) => option.name}
        onChange={() => props.handleSelectChange}
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
        onClick={() => {
          setOpen(!open);
        }}
      >
        <SVG src={imgSrc("edit")} style={{ width: "22px", height: "auto" }} />
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
