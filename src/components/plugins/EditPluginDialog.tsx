import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  Divider,
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import { theme, icons } from "@gliff-ai/style";
import { IPlugin, Project } from "@/interfaces";
import { ProjectsAutocomplete } from "./ProjectsAutocomplete";
import { ProductsRadioForm } from "./ProductsRadioForm";
import { ServiceFunctions } from "../../api";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  topography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "8px",
  },
  paperBody: { width: "25vw", margin: "10px 20px" },
  settingsIcon: { width: "20px", height: "auto" },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  closeIcon: { width: "15px" },
  marginTop: { marginTop: "15px" },
  divider: { width: "500px", margin: "12px -20px" },
  greenButton: {
    backgroundColor: theme.palette.primary.main,
    "&:disabled": {
      backgroundColor: theme.palette.grey[300],
    },
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  dialogActions: { justifyContent: "end", marginTop: "30px" },
  tab: { display: "inline-block", marginLeft: "20px" },
});

interface Props {
  plugin: IPlugin;
  allProjects: Project[];
  updatePlugins: (prevPlugin: IPlugin, plugin: IPlugin) => void;
  services: ServiceFunctions;
  setError: (error: string) => void;
}

export function EditPluginDialog({
  plugin,
  allProjects,
  updatePlugins,
  services,
  setError,
}: Props): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [newPlugin, setNewPlugin] = useState<IPlugin>(plugin);

  const classes = useStyles();

  useEffect(() => {
    // reset values to default on dialog closed
    if (!open) {
      setNewPlugin(plugin);
    }
  }, [open]);

  const editDialogSection = (
    <>
      <TextField
        className={classes.marginTop}
        variant="outlined"
        value={newPlugin.name}
        placeholder="Plug-in Name"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, name: e.target.value } as IPlugin));
        }}
      />

      <Divider className={classes.divider} />

      <p>
        <b>Type:</b>
        <span className={classes.tab} />
        {plugin.type}
      </p>
      <p>
        <b>URL:</b>
        <span className={classes.tab} />
        {plugin.url}
      </p>

      <Divider className={classes.divider} />
      <ProductsRadioForm newPlugin={newPlugin} setNewPlugin={setNewPlugin} />
      <Divider className={classes.divider} />
      <ProjectsAutocomplete
        allProjects={allProjects}
        plugin={newPlugin}
        setPlugin={setNewPlugin}
        services={services}
        setError={setError}
      />
    </>
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <SVG src={icons.removeLabel} className={classes.settingsIcon} />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Card>
          <Paper
            className={classes.paperHeader}
            elevation={0}
            variant="outlined"
            square
          >
            <Typography className={classes.topography}>Edit Plug-in</Typography>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
            >
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper className={classes.paperBody} elevation={0} square>
            {editDialogSection}
            <DialogActions className={classes.dialogActions}>
              <Button
                variant="outlined"
                className={classes.greenButton}
                disabled={JSON.stringify(newPlugin) === JSON.stringify(plugin)}
                onClick={() => updatePlugins(plugin, newPlugin)}
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
