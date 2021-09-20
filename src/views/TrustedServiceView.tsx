import { useEffect, useState, ChangeEvent, ReactElement } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  TextField,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Clear, Add } from "@material-ui/icons";
import { theme,  } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Project, Profile, Team } from "@/interfaces";
import { InviteDialog, LaunchIcon } from "@/components";

const useStyles = () =>
  makeStyles(() => ({
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
    cancelButton: {
      textTransform: "none",
    },
    OKButton: {
      "&:hover": {
        backgroundColor: theme.palette.info.main,
      },
    },

    // eslint-disable-next-line mui-unused-classes/unused-classes
    "@global": {
      '.MuiAutocomplete-option[data-focus="true"]': {
        background: "#01dbff",
      },
    },
    tableCell: { padding: "0px 16px 0px 25px", fontSize: "16px" },
  }));

interface Props {
  services: ServiceFunctions;
  
  
}

export const TrustedServiceView = (props: Props): ReactElement => {
  const auth = useAuth();
  // const [newProjectName, setNewProjectName] = useState<string>(""); // string entered in text field in New Project dialog
  const [projects, setProjects] = useState<Project[]>([]); // all projects
  const [dialogOpen, setDialogOpen] = useState(false); // New Project dialog
  const classes = useStyles()();

 
  // useEffect(() => {
  //   if (auth?.user?.email) {
  //     void props.services
  //       .getTrustedServices(null, auth.user.authToken)
  //       .then((p: Project[]) => {
  //         setTrustedServices(p);
  //       });
  //   }
  // }, [auth, props.services]);


  // const createProject = async (): Promise<string> => {
  //   await props.services.createProject({ name: newProjectName });
  //   const p = (await props.services.getProjects()) as Project[];
  //   setProjects(p);
  //   // TODO: would be nice if services.createProject could return the uid of the new project
  //   console.log(p);
  //   return p.find((project) => project.name === newProjectName).uid;
  // };

  const trustedService = ({ name, uid }: Project) => (
    <TableRow key={uid}>
      <TableCell className={classes.tableCell}>{name}</TableCell>
      <TableCell className={classes.tableCell} align="right">
        {" "}
      </TableCell>
    </TableRow>
  );

  if (!auth) return null;

  return (
    <>
      <Card style={{ width: "100%", height: "85vh", marginRight: "20px" }}>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography
            className={classes.projectsTopography}
            style={{ marginLeft: "14px" }}
          >
            Trusted Services
          </Typography>
        </Paper>

        <Paper elevation={0} square>
          <List style={{ paddingBottom: "0px" }}>
            <ListItem
              divider
              style={{ padding: "0px 0px 0px 10px", cursor: "pointer" }}
              onClick={() => {
                setDialogOpen(!dialogOpen);
              }}
            >
              <div
                style={{
                  margin: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Add
                  fontSize="large"
                  style={{ marginRight: "10px", color: "grey" }}
                />
                <Typography style={{ color: "grey" }}>
                  Add New Trusted Service
                </Typography>
              </div>
            </ListItem>
          </List>

          <TableContainer>
            <Table aria-label="simple table">
              <TableBody>{projects.map(trustedService)}</TableBody>
            </Table>
          </TableContainer>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <Card>
              <Paper
                elevation={0}
                variant="outlined"
                square
                className={classes.paperHeader}
              >
                <Typography className={classes.projectsTopography}>
                  New Trusted Service
                </Typography>
              </Paper>
            </Card>
          </Dialog>
        </Paper>
      </Card>
    </>
  );
};

TrustedServiceView.defaultProps = {

};
