import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  List,
  ListItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  ListSubheader,
  Box,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Send } from "@mui/icons-material";
import { LoadingSpinner, WarningSnackbar, theme } from "@gliff-ai/style";

import { Project, Team } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";

const useStyles = makeStyles(() => ({
  topography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
    paddingLeft: "8px",
  },
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
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
  tableText: {
    fontSize: "16px",
    paddingLeft: "20px",
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

export const CollaboratorsView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [collaboratorProjects, setCollaboratorProjects] = useState([]);
  const classes = useStyles();
  const isMounted = useRef(false);
  const [open, setOpen] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  const inviteNewCollaborator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteMessage("");

    try {
      const result = await props.services.inviteCollaborator({
        email: inviteEmail,
      });

      if (result) {
        setInviteEmail("");
        setInviteMessage("Invite was sent");
      } else {
        setInviteMessage("An error happened with the invite");
      }
    } catch (e: any) {
      setOpen(true);
      console.error(`${(e as Error).message}`);
    }
  };

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((t: Team) => {
          setStateIfMounted(t, setTeam, isMounted.current);
        });
    }
  }, [auth, props.services, isMounted]);

  useEffect(() => {
    if (!team?.profiles) return;

    const getCollaboratingProject = async (
      collaboratorEmail: string
    ): Promise<string> => {
      const result: string = await props.services
        .getCollaboratorProject(
          {
            email: collaboratorEmail,
          },
          auth.user.authToken
        )
        .then((p: Project[]): string => {
          if (p.length > 1) {
            return "Error!";
          }
          return p[0].name;
        });

      if (result) {
        return result;
      }
      return "";
    };

    const collaboratorProjectsPromises = [];
    for (let i = 0; i < team.profiles.length; i += 1) {
      collaboratorProjectsPromises[i] = getCollaboratingProject(
        team.profiles[i].email
      );
    }
    void Promise.all(collaboratorProjectsPromises).then((result) => {
      setStateIfMounted(result, setCollaboratorProjects, isMounted.current);
    });
  }, [team, props.services, auth, isMounted]);

  let pendingInvites;
  if (team?.pending_invites?.length > 0) {
    pendingInvites = (
      <List>
        {team?.pending_invites.map(
          ({ email, sent_date, is_collaborator }) =>
            is_collaborator && (
              <ListItem key={email}>
                {email} - {sent_date}
              </ListItem>
            )
        )}
      </List>
    );
  } else if (team?.pending_invites?.length === 0) {
    pendingInvites = (
      <Typography style={{ marginTop: "10px", marginBottom: "15px" }}>
        No pending invites
      </Typography>
    );
  } else {
    pendingInvites = <LoadingSpinner />;
  }

  const inviteForm = (
    <>
      <Typography>
        Why not invite someone else to collaborate on your project?
      </Typography>
      <form autoComplete="off" onSubmit={inviteNewCollaborator}>
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
    </>
  );

  if (!auth) return null;

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
          <Typography className={classes.topography}>Collaborators</Typography>
        </Paper>

        {team?.profiles ? (
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableText}>Name</TableCell>
                  <TableCell className={classes.tableText}>Email</TableCell>
                  <TableCell className={classes.tableText}>Project</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team?.profiles.map(
                  ({ email, name, is_collaborator }, index) =>
                    is_collaborator && (
                      <TableRow key={email}>
                        <TableCell className={classes.tableText}>
                          {name}
                        </TableCell>
                        <TableCell className={classes.tableText}>
                          {email}
                        </TableCell>
                        <TableCell>{collaboratorProjects[index]}</TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
              gliff.ai collaborators
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            <Typography>
              gliff.ai collaborators allow you to engage domain experts key to
              annotation data to develop AI models.
            </Typography>
            <List>
              <ListSubheader className={classes.featureListHeader}>
                A collaborator can:
              </ListSubheader>
              <ListItem className={classes.featureListItem}>
                Create annotations on images assigned to them
              </ListItem>
              <ListSubheader className={classes.featureListHeader}>
                A collaborator cannot:
              </ListSubheader>
              <ListItem className={classes.featureListItem}>
                Create, delete and modify projects
              </ListItem>
              <ListItem className={classes.featureListItem}>
                Upload new data
              </ListItem>
              <ListItem className={classes.featureListItem}>
                See a project audit (plan dependent)
              </ListItem>
              <ListItem className={classes.featureListItem}>
                See or update billing
              </ListItem>
            </List>
            <Typography>
              Need something more powerful? Why not consider team members
              instead of collaborators?
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
              Pending collaborator invites
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {pendingInvites}
            <hr
              style={{ width: "80%", marginLeft: "5px", marginRight: "5px" }}
            />
            {inviteForm}
          </Paper>
        </Card>
      </div>
      <WarningSnackbar
        open={open}
        onClose={() => setOpen(false)}
        messageText="Cant invite new user, limit is reached"
      />
    </>
  );
};
