import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import {
  theme,
  IconButton,
  icons,
  lightGrey,
  Dialog,
  Box,
  Divider,
  TextField,
  Button,
  Typography,
} from "@gliff-ai/style";
import { Plugin, PluginType, Project } from "@/interfaces";
import { ProjectsAutocomplete } from "./ProjectsAutocomplete";
import { ProductsRadioForm } from "./ProductsRadioForm";
import { ServiceFunctions } from "../../api";
import { Notepad } from "../Notepad";

const tab = {
  display: "inline-block",
  marginLeft: "20px",
  fontWeight: 400,
};

const divider = {
  width: "500px !important",
  margin: "12px -20px !important",
};

const greenButtonStyle = {
  backgroundColor: `${theme.palette.primary.main} !important`,
  "&:disabled": {
    backgroundColor: lightGrey,
  },
  textTransform: "none",
  ":hover": {
    backgroundColor: theme.palette.info.main,
  },
};

interface Props {
  plugin: Plugin;
  allProjects: Project[] | null;
  updatePlugins: (prevPlugin: Plugin, plugin: Plugin) => void;
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
  const [newPlugin, setNewPlugin] = useState<Plugin>(plugin);
  const [closeDialog, setCloseDialog] = useState<boolean>(false);

  const resetDefaults = (): void => {
    setNewPlugin(plugin);
  };

  useEffect(() => {
    if (closeDialog) {
      setCloseDialog(false);
    }
  }, [closeDialog]);

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
        sx={{ marginTop: "15px" }}
        value={newPlugin.name}
        placeholder="Plug-in Name"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, name: e.target.value } as Plugin));
        }}
        inputProps={{
          maxLength: 50, // NOTE: name for python or AI plugins cannot be over 50 characters, otherwise 500
        }}
        variant="outlined"
      />
      <Divider sx={{ ...divider }} />
      <Notepad
        placeholder="Plug-in Description (Optional)"
        value={newPlugin.description}
        onChange={(event) => {
          setNewPlugin((p) => ({
            ...p,
            description: event.target.value,
          }));
        }}
        rows={6}
      />
      <Divider sx={{ ...divider }} />
      <Typography sx={{ fontWeight: 700 }}>
        Type:
        <Box component="span" sx={{ ...tab }}>
          {plugin.type}
        </Box>
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        URL:
        <Box component="span" sx={{ ...tab }}>
          {plugin.url}
        </Box>
      </Typography>
      <Divider sx={{ ...divider }} />
      <ProductsRadioForm newPlugin={newPlugin} setNewPlugin={setNewPlugin} />
      <Divider sx={{ ...divider }} />
      <ProjectsAutocomplete
        allProjects={allProjects}
        plugin={newPlugin}
        setPlugin={setNewPlugin}
      />
    </>
  );

  return (
    <>
      <Dialog
        title="Edit Plug-in"
        close={closeDialog}
        TriggerButton={
          <IconButton
            tooltip={{
              name: "Settings",
            }}
            icon={icons.cog}
            size="small"
            tooltipPlacement="top"
            id={`edit-plugin-${plugin.name}`}
          />
        }
        afterClose={resetDefaults}
      >
        <Box sx={{ width: "350px" }}>
          {editDialogSection}
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              marginTop: "30px",
            }}
          >
            <Button
              variant="outlined"
              sx={{ ...greenButtonStyle }}
              disabled={JSON.stringify(newPlugin) === JSON.stringify(plugin)}
              onClick={async () => {
                const finalColUids = await updatePluginProjects();

                updatePlugins(plugin, {
                  ...newPlugin,
                  collection_uids: finalColUids,
                });
                setCloseDialog(true);
                resetDefaults();
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
