import { ChangeEvent, useEffect, useState } from "react";
import {
  Paper,
  IconButton,
  Grid,
  Typography,
  Card,
  makeStyles,
  Theme,
  List,
  ListItem,
  TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { Team } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";

const useStyles = makeStyles((theme: Theme) => ({
  topography: {
    color: "#ffffff",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
  },
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  paperBody: {
    margin: "15px",
    width: "400px",
    height: "auto",
    fontSize: "17px",
  },
  pendingInvitesCard: {
    marginTop: "20px",
  },
}));

interface Props {
  services: ServiceFunctions;
}

export const UsersView = (props: Props): JSX.Element => {
  const auth = useAuth();

  if (!auth) return null;
  const [team, setTeam] = useState<Team>({
    profiles: [],
    pending_invites: [],
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const classes = useStyles();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  const inviteNewUser = async (event: ChangeEvent): Promise<void> => {
    event.preventDefault();
    setInviteMessage("");

    const result = await props.services.inviteUser({
      email: inviteEmail,
    });

    if (result) {
      setInviteEmail("");
      setInviteMessage("Invite was sent");
    } else {
      setInviteMessage("An error happened with the invite");
    }
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((t: Team) => setTeam(t));
    }
  }, [auth]);

  let pendingInvites;
  if (team?.pending_invites?.length > 0) {
    pendingInvites = (
      <List>
        {team?.pending_invites.map(({ email, sent_date }) => (
          <ListItem key={email}>
            {email} - {sent_date}
          </ListItem>
        ))}
      </List>
    );
  } else {
    pendingInvites = <>No pending invites</>;
  }

  const inviteForm = (
    <form autoComplete="off" onSubmit={() => inviteNewUser}>
      <div>{inviteMessage}</div>
      <TextField
        id="invite-email"
        type="email"
        required
        onChange={handleChange}
        value={inviteEmail}
      />
      <IconButton type="submit" onSubmit={(e) => e.preventDefault()}>
        <Send />
      </IconButton>
    </form>
  );

  return (
    <>
      <Grid container direction="row">
        <Card>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              Current Users
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            <List>
              {team?.profiles.map(({ email, name }) => (
                <ListItem key={email}>{name}</ListItem>
              ))}
            </List>
          </Paper>
        </Card>
      </Grid>
      <Grid container direction="row">
        <Card className={classes.pendingInvitesCard}>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              Pending Invites
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {pendingInvites}
            {inviteForm}
          </Paper>
        </Card>
      </Grid>
    </>
  );
};
