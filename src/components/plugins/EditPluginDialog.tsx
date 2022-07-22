import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import {
  IconButton,
  icons,
  Dialogue,
  Box,
  Divider,
  TextField,
  Button,
  Typography,
} from "@gliff-ai/style";
import { IPluginOut, PluginType, Project } from "@/interfaces";
import { ProjectsAutocomplete } from "./ProjectsAutocomplete";
import { ProductsRadioForm } from "./ProductsRadioForm";
import { ServiceFunctions } from "../../api";

const tab = {
  display: "inline-block",
  marginLeft: "20px",
  fontWeight: 400,
};

const divider = {
  width: "500px !important",
  margin: "12px -20px !important",
};

interface Props {
  pendingProjectInvites: string[];
  plugin: IPluginOut;
  allProjects: Project[] | null;
  updatePlugins: (prevPlugin: IPluginOut, plugin: IPluginOut) => void;
  services: ServiceFunctions;
  setError: (error: string) => void;
}

export function EditPluginDialog({
  pendingProjectInvites,
  plugin,
  allProjects,
  updatePlugins,
  services,
  setError,
}: Props): ReactElement {
  const [newPlugin, setNewPlugin] = useState<IPluginOut>(plugin);
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
          setNewPlugin((p) => ({ ...p, name: e.target.value } as IPluginOut));
        }}
        inputProps={{
          maxLength: 50, // NOTE: name for python or AI plugins cannot be over 50 characters, otherwise 500
        }}
        variant="outlined"
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
      </Typography>{" "}
      <Divider sx={{ ...divider }} />
      <ProductsRadioForm newPlugin={newPlugin} setNewPlugin={setNewPlugin} />
      <Divider sx={{ ...divider }} />
      <ProjectsAutocomplete
        pendingProjectInvites={pendingProjectInvites}
        allProjects={allProjects}
        plugin={newPlugin}
        setPlugin={setNewPlugin}
      />
    </>
  );

  return (
    <>
      <Dialogue
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
              variant="contained"
              color="primary"
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
              text="Confirm"
            />
          </Box>
        </Box>
      </Dialogue>
    </>
  );
}
