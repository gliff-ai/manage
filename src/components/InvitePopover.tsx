import { useState, ChangeEvent } from "react";
import {
  Paper,
  Button,
  Card,
  Popover,
  IconButton,
  Typography,
  makeStyles,
  Theme,
  TextField,
  MenuItem,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import { Profile } from "@/interfaces";

const EditIcon = require("../assets/Edit_Details.svg") as string;

const useStyles = makeStyles((theme: Theme) => ({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    hegith: "400px",
  },
  inviteBtn: {
    marginLeft: "15px",
  },
  userInviteTopography: {
    color: "#ffffff",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
  },
  paperBody: {
    margin: "15px",
  },
}));

interface Props {
  projectInvitee: string;
  projectInvitees: Profile[];
  handleSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  inviteToProject: () => void;
}

export function InvitePopover(props: Props): React.ReactElement {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const inviteSelect = (
    <form noValidate autoComplete="off">
      <TextField
        select
        value={props.projectInvitee}
        onChange={() => props.handleSelectChange}
      >
        {props.projectInvitees.map((el: Profile) => (
          <MenuItem key={el.email} value={el.email}>
            {el.name}
          </MenuItem>
        ))}
      </TextField>
      <Button className={classes.inviteBtn} onClick={props.inviteToProject}>
        Invite
      </Button>
    </form>
  );

  return (
    <>
      <IconButton onClick={handleClick}>
        <SVG src={EditIcon} style={{ width: "22px", height: "auto" }} />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
      </Popover>
    </>
  );
}
