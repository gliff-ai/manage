import { ReactElement, useEffect, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import { theme, icons } from "@gliff-ai/style";
import { IPlugin, Project } from "@/interfaces";
import { ServiceFunctions } from "@/api";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.secondary.main,
  },
  paperBody: { width: "25vw", margin: "20px" },
  topography: {
    color: "#FFFFFF",
    display: "inline",
    fontSize: "21px",
    marginLeft: "10px",
  },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  closeIcon: { width: "15px", height: "auto", fill: "#FFFFFF" },
  warningIcon: {
    width: "20px",
    height: "auto",
    marginRight: "10px",
    fill: "#FFFFFF",
  },
  dialogActions: { justifyContent: "space-between", marginTop: "30px" },
  whiteButton: {
    textTransform: "none",
    backgroundColor: "transparent",
  },
  purpleButton: {
    backgroundColor: theme.palette.secondary.main,
    textTransform: "none",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  purpleText: {
    color: theme.palette.secondary.main,
    fontWeight: 500,
    display: "inline",
  },
  deleteIcon: { width: "20px", height: "auto" },
});

interface Props {
  plugin: IPlugin;
  services: ServiceFunctions;
  currentProjects: Project[];
}

export function DeletePluginDialog(props: Props): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const classes = useStyles();
  console.log(canDelete);

  const triggerDelete = () => {
    if (props.currentProjects.length > 0) {
      setOpen(true);
    } else {
      setCanDelete(true);
    }
  };

  useEffect(() => {
    if (canDelete) {
      void props.services.deletePlugin().then(() => {
        setOpen(false);
      });
    }
  }, [canDelete]);

  useEffect(() => {
    if (!open) {
      setCanDelete(false);
    }
  }, [open]);

  return (
    <>
      <IconButton onClick={triggerDelete}>
        <SVG className={classes.deleteIcon} src={icons.delete} />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Card>
          <Paper
            className={classes.paperHeader}
            elevation={0}
            variant="outlined"
            square
          >
            <Typography className={classes.topography}>
              <SVG src={icons.warning} className={classes.warningIcon} />
              Are You Sure?
            </Typography>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
            >
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            <span>
              <p className={classes.purpleText}>{props.plugin.name}</p>
              &nbsp;plug-in is currently enabled in&nbsp;
              <p className={classes.purpleText}>
                {props.currentProjects.length}
              </p>
              &nbsp;projects.
            </span>
            <p>Do you want to delete this plug-in or cancel?</p>
            <DialogActions className={classes.dialogActions}>
              <Button
                variant="outlined"
                className={classes.whiteButton}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                className={classes.purpleButton}
                onClick={() => {
                  setCanDelete(true);
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
