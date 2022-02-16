import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import { theme, icons, lightGrey } from "@gliff-ai/style";
import { IPlugin, PluginType, Project } from "@/interfaces";
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
  paperBody: { width: "350px", margin: "10px 20px" },
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
      backgroundColor: lightGrey,
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
  allProjects: Project[] | null;
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
  }, [open, plugin]);

  if (!allProjects) return null;

  const updatePluginProjects = async (): Promise<string[]> => {
    const finalColUids = [...newPlugin.collection_uids];

    if (newPlugin.type !== PluginType.Javascript) {
      // invite or remove plugin user to join the selected projects
      await Promise.all(
        allProjects.map(async ({ uid, name }) => {
          if (
            !plugin.collection_uids.includes(uid) &&
            newPlugin.collection_uids.includes(uid)
          ) {
            try {
              await services.inviteToProject({
                projectUid: uid,
                email: newPlugin.username,
              });
            } catch (e) {
              console.log(e);
              setError(
                `Cannot add ${plugin.name} to ${name}: the invitation is pending.`
              );
              finalColUids.splice(finalColUids.indexOf(uid), 1);
            }
          }

          if (
            plugin.collection_uids.includes(uid) &&
            !newPlugin.collection_uids.includes(uid)
          ) {
            try {
              await services.removeFromProject({
                projectUid: uid,
                email: newPlugin.username,
              });
            } catch (e) {
              console.log(e);
              setError(
                `Cannot remove ${plugin.name} from ${name}: the invitation is pending.`
              );
              finalColUids.push(uid);
            }
          }
        })
      );
    }
    return finalColUids;
  };

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
      />
    </>
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <SVG src={icons.cog} className={classes.settingsIcon} />
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
                onClick={async () => {
                  const finalColUids = await updatePluginProjects();

                  updatePlugins(plugin, {
                    ...newPlugin,
                    collection_uids: finalColUids,
                  });
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
