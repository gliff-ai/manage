import {
  ReactElement,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import {
  theme,
  IconButton as GliffIconButton,
  icons,
  middleGrey,
} from "@gliff-ai/style";
import { IPlugin } from "@/interfaces";
import { ServiceFunctions } from "@/api";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px 20px",
    backgroundColor: theme.palette.info.light,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  paperBody: { width: "450px", margin: "20px", fontSize: "16px" },
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
    width: "25px",
    height: "25px",
    fill: "#FFFFFF",
  },
  dialogActions: {
    justifyContent: "space-between",
    margin: "5px 10px",
  },
  whiteButton: {
    textTransform: "none",
    backgroundColor: "transparent",
    borderColor: middleGrey,
    "&:hover": {
      borderColor: middleGrey,
    },
  },
  purpleButton: {
    backgroundColor: theme.palette.info.light,
    borderColor: theme.palette.info.light,
    textTransform: "none",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: theme.palette.info.light,
    },
  },
  purpleText: {
    color: theme.palette.info.light,
    fontWeight: 500,
    display: "inline",
  },
});

interface Props {
  plugin: IPlugin;
  setPlugins: Dispatch<SetStateAction<IPlugin[]>>;
  services: ServiceFunctions;
}

export function DeletePluginDialog({
  plugin,
  services,
  setPlugins,
}: Props): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const classes = useStyles();

  const triggerDelete = () => {
    if (plugin.collection_uids.length > 0) {
      setOpen(true);
    } else {
      setCanDelete(true);
    }
  };

  useEffect(() => {
    if (canDelete) {
      void services.deletePlugin({ ...plugin }).then((result) => {
        if (result) {
          setPlugins((prevPlugins) => prevPlugins.filter((p) => p !== plugin));
        }
        setOpen(false);
      });
    }
  }, [canDelete, services, plugin, setPlugins]);

  useEffect(() => {
    if (!open) {
      setCanDelete(false);
    }
  }, [open]);

  return (
    <>
      <GliffIconButton
        icon={icons.delete}
        tooltip={{ name: "Delete" }}
        onClick={triggerDelete}
        tooltipPlacement="top"
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Card>
          <Paper
            className={classes.paperHeader}
            elevation={0}
            variant="outlined"
            square
          >
            <SVG src={icons.warning} className={classes.warningIcon} />
            <Typography className={classes.topography}>
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
              <p className={classes.purpleText}>{plugin.name}</p>
              &nbsp;plug-in is currently enabled in&nbsp;
              <p className={classes.purpleText}>
                {plugin.collection_uids.length}
              </p>
              &nbsp;projects.
            </span>
            <p>Do you want to delete this plug-in or cancel?</p>
          </Paper>
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
        </Card>
      </Dialog>
    </>
  );
}
