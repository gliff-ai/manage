import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  List,
  ListItem,
  TextField,
  ListSubheader,
  Box,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Send } from "@mui/icons-material";
import { LoadingSpinner, WarningSnackbar, theme } from "@gliff-ai/style";
import { Team } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableCell, TableRow } from "@/components";

const useStyles = makeStyles(() => ({
  paperHeader: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "50px",
  },
  topography: {
    color: "#000000",
    fontSize: "21px",
    marginLeft: "20px !important",
  },
  paperBody: {
    margin: "15px",
    width: "95%",
    fontSize: "17px",
    paddingLeft: "6px",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    width: "30%",
    marginRight: "20px",
  },
  teamCard: {
    marginRight: "20px",
    marginBottom: "20px",
    overflow: "auto",
  },
  textField: {
    width: "200px",
  },
  featureListHeader: {
    fontSize: "14px",
    lineHeight: "16px",
    padding: "5px 5px 0px",
  },
  featureListItem: {
    fontSize: "12px",
    lineHeight: "14px",
    padding: "0px 15px 0px",
  },
}));

interface Props {
  services: ServiceFunctions;
}

export const TeamView = ({ services }: Props): JSX.Element => {
  const auth = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  const inviteNewUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteMessage("");

    try {
      await services.inviteUser({
        email: inviteEmail,
      });
      setInviteEmail("");
      setInviteMessage("Invite was sent");
    } catch (e: any) {
      setOpen(true);
      console.error(`${(e as Error).message}`);
    }
  };

  useEffect(() => {
    if (!auth?.user?.authToken) return;

    void services.queryTeam(null, auth.user.authToken).then((newTeam: Team) => {
      newTeam.profiles = newTeam.profiles.filter(
        ({ is_trusted_service }) => !is_trusted_service
      );
      setTeam(newTeam);
    });
  }, [auth?.user?.authToken, services]);

  if (!auth?.user) return null;

  return (
    <>
      <Card
        className={classes.teamCard}
        style={{ width: "70%", height: "85vh" }}
      >
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.topography}>Team Members</Typography>
        </Paper>
        {team?.profiles ? (
          <Table header={["Name", "Email"]} hasButtonsCell={false}>
            {team?.profiles.map(
              ({ email, name, is_collaborator }) =>
                !is_collaborator && (
                  <TableRow key={email}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{email}</TableCell>
                  </TableRow>
                )
            )}
          </Table>
        ) : (
          <Box display="flex" height="100%">
            <LoadingSpinner />
          </Box>
        )}
      </Card>
      <div className={classes.cardsContainer}>
        <Card
          className={classes.teamCard}
          style={{ width: "100%", height: "100%" }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              gliff.ai teams
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            <Typography>
              gliff.ai teams allow you to bring together domain experts, data
              experts and compliance experts to develop your AI models.
            </Typography>
            <List>
              <ListSubheader className={classes.featureListHeader}>
                A team member can:
              </ListSubheader>
              <ListItem className={classes.featureListItem}>
                Create, delete and modify projects
              </ListItem>
              <ListItem className={classes.featureListItem}>
                Upload new data
              </ListItem>
              <ListItem className={classes.featureListItem}>
                Create annotations
              </ListItem>
              <ListItem className={classes.featureListItem}>
                See a project audit (plan dependent)
              </ListItem>
              <ListSubheader className={classes.featureListHeader}>
                A team member cannot:
              </ListSubheader>
              <ListItem className={classes.featureListItem}>
                See or update billing
              </ListItem>
            </List>
            <Typography>
              Just want an expert to add annotations to your data? Why not
              consider collaborators instead of team members?
            </Typography>
          </Paper>
        </Card>
        <Card
          className={classes.teamCard}
          style={{ width: "100%", height: "100%" }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              Pending team invites
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {!team?.pending_invites && <LoadingSpinner />}
            {team?.pending_invites?.length === 0 && (
              <Typography style={{ marginTop: "10px", marginBottom: "15px" }}>
                No pending invites
              </Typography>
            )}
            {team?.pending_invites?.length > 0 && (
              <List>
                {team?.pending_invites.map(
                  ({ email, sent_date, is_collaborator }) =>
                    !is_collaborator && (
                      <ListItem key={email}>
                        {email} - {sent_date}
                      </ListItem>
                    )
                )}
              </List>
            )}
            <hr
              style={{ width: "80%", marginLeft: "5px", marginRight: "5px" }}
            />
            <Typography>Why not invite someone else to the team?</Typography>
            <form autoComplete="off" onSubmit={inviteNewUser}>
              <div>{inviteMessage}</div>
              <div style={{ display: "flex" }}>
                <TextField
                  id="invite-email"
                  type="email"
                  required
                  onChange={handleChange}
                  value={inviteEmail}
                  label="Email address"
                  className={classes.textField}
                  variant="filled"
                />
                <IconButton type="submit" size="large">
                  <Send />
                </IconButton>
              </div>
            </form>
          </Paper>
        </Card>
      </div>
      <WarningSnackbar
        open={open}
        onClose={() => setOpen(false)}
        messageText="Cant invite new user"
      />
    </>
  );
};
