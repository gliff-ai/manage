import { useEffect, useState, ChangeEvent } from "react";
import { ServiceFunctions } from "@/api";
import {
  Paper,
  IconButton,
  Grid,
  Typography,
  Card,
  makeStyles,
  Theme,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useAuth } from "@/hooks/use-auth";
import { Project, Team } from "@/interfaces";
import { InvitePopover } from "@/components/InvitePopover";

const useStyles = (props: Props) =>
  makeStyles((theme: Theme) => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
    projectsTopography: {
      color: "#ffffff",
      display: "inline",
      fontSize: "21px",
      marginRight: "125px",
    },
    projectAddIconBtn: {
      right: "16px",
    },
  }));

interface Props {
  services: ServiceFunctions;
}

export const ProjectsView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectInvitee, setInvitee] = useState("");
  const [projectInvitees, setInvitees] = useState([]);

  if (!auth) return null;
  const classes = useStyles(props)();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setProjectName(value);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const { value } = event.target;
    setInvitee(value);
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .getProjects(null, auth.user.authToken)
        .then((p: Project[]) => {
          setProjects(p);
        });

      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((team: Team) => {
          const invitees = team.profiles.filter(
            ({ email }) => email !== auth?.user?.email
          );
          setInvitees(invitees);
          if (invitees.length > 0) {
            setInvitee(invitees[0].email);
          }
        });
    }
  }, [auth]);

  const inviteToProject = (projectId: string, inviteeEmail: string) => {
    if (!projectInvitee) return false;

    return props.services
      .inviteToProject({ projectId, email: inviteeEmail })
      .then(() => {
        console.log("invite complete!");
      });
  };

  const createProject = async (): Promise<void> => {
    await props.services.createProject({ name: projectName });
    const p = (await props.services.getProjects()) as Project[];
    setProjects(p);
    setProjectName("");
  };

  const project = ({ name, uid }: Project) => (
    <ListItem key={name}>
      <ListItemText key={name} primary={name} />
      <ListItemSecondaryAction>
        <InvitePopover
          projectInvitee={projectInvitee}
          projectInvitees={projectInvitees}
          handleSelectChange={handleSelectChange}
          inviteToProject={() => inviteToProject(uid, projectInvitee)}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Grid container direction="row">
      <Card>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.projectsTopography}>
            Projects
          </Typography>
        </Paper>
        <Paper elevation={0} square>
          <InputBase
            placeholder="New project"
            value={projectName}
            onChange={handleChange}
            inputProps={{
              style: { fontSize: 18, marginLeft: 15, marginRight: 50 },
            }}
          />
          <IconButton
            onClick={createProject}
            className={classes.projectAddIconBtn}
          >
            <Add />
          </IconButton>
          <List>{projects.map(project)}</List>
        </Paper>
      </Card>
    </Grid>
  );
};
