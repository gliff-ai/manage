import { useEffect, useState, ChangeEvent } from "react";
import { ServiceFunctions } from "@/api";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  makeStyles,
  Theme,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useAuth } from "@/hooks/use-auth";
import { Project, Team } from "@/interfaces";
import { InvitePopover } from "@/components/InvitePopover";
import { PageSelector } from "@/components/PageSelector";

const useStyles = (props: Props) =>
  makeStyles((theme: Theme) => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
    projectsTopography: {
      color: "#000000",
      display: "inline",
      fontSize: "21px",
      marginRight: "125px",
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
    <>
      <ListItem key={name} divider>
        <ListItemText key={name} primary={name} />
        {/* <ListItemText key={name+"_members"} primary={} /> */}
        <ListItemSecondaryAction>
          <InvitePopover
            projectInvitee={projectInvitee}
            projectInvitees={projectInvitees}
            handleSelectChange={handleSelectChange}
            inviteToProject={() => inviteToProject(uid, projectInvitee)}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          flexGrow: 0,
          flexShrink: 0,
          marginLeft: "20px",
          marginRight: "20px",
        }}
      >
        <PageSelector page="projects" />
      </div>
      <Card style={{ width: "100%", height: "90vh", marginRight: "20px" }}>
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
          <List>
            <ListItem divider style={{ padding: "0px 0px 0px 10px" }}>
              <IconButton
                onClick={(e) => {
                  console.log(e);
                  createProject();
                }}
                style={{ marginBottom: "5px" }}
              >
                <Add />
              </IconButton>
              <InputBase
                placeholder="Create New Project"
                value={projectName}
                onChange={handleChange}
                onKeyPress={(e) => {
                  if (e.code === "Enter") {
                    createProject();
                  }
                }}
                inputProps={{
                  style: { fontSize: 18 },
                }}
              />
            </ListItem>
            {projects.map(project)}
          </List>
        </Paper>
      </Card>
    </div>
  );
};
