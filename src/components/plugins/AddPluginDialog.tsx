import { ReactElement, useState, ChangeEvent, useEffect } from "react";

import {
  icons,
  IconButton,
  Dialogue,
  Typography,
  Button,
  Paper,
  TextField,
  RadioGroup,
  FormControl,
  Box,
  Divider,
} from "@gliff-ai/style";
import { IPluginOut, Product, PluginType, Project } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { FormLabelControl } from "./FormLabelControl";
import { ProductsRadioForm } from "./ProductsRadioForm";
import { ProjectsAutocomplete } from "./ProjectsAutocomplete";

const marginTop = { marginTop: "15px" };
const divider = { width: "500px !important", margin: "12px -20px !important" };

enum DialogPage {
  pickPluginType,
  enterValues,
  accessKey,
}

interface Props {
  projects: Project[] | null;
  services: ServiceFunctions;
  setError: (error: string) => void;
  getPlugins: () => void;
}

const defaultPlugin = {
  type: PluginType.Javascript,
  name: "",
  url: "",
  products: Product.ALL,
  enabled: false,
  collection_uids: [] as string[],
};

export function AddPluginDialog({
  services,
  setError,
  projects,
  getPlugins,
}: Props): ReactElement {
  const [closeDialog, setCloseDialog] = useState<boolean>(false);
  const [key, setKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dialogPage, setDialogPage] = useState(DialogPage.pickPluginType);
  const [newPlugin, setNewPlugin] = useState<IPluginOut>(defaultPlugin);
  const [validUrl, setValidUrl] = useState<boolean>(true);

  useEffect(() => {
    if (closeDialog) {
      setCloseDialog(false);
    }
  }, [closeDialog]);

  const resetDefaults = (): void => {
    // Reset defaults values
    setTimeout(() => {
      // NOTE: setTimeout is used to update the dialog page
      // after the dialog has disappeared from view
      setNewPlugin(defaultPlugin);
      setCreating(false);
      setDialogPage(DialogPage.pickPluginType);
      setKey(null);
      setError(null);
      setValidUrl(true);
    }, 500);
  };

  if (!projects) return null;

  const addPluginToProjects = async (plugin: IPluginOut, email: string) => {
    await Promise.allSettled(
      plugin.collection_uids.map(async (projectUid) => {
        try {
          await services.inviteToProject({
            projectUid,
            email,
          });
        } catch (e) {
          console.log(e);
        }
      })
    );
  };

  const createPlugin = async (): Promise<boolean> => {
    try {
      const result = (await services.createPlugin({ ...newPlugin })) as {
        key: string;
        email: string;
      } | null;

      if (newPlugin.type === PluginType.Javascript) {
        setCloseDialog(true);
        return true;
      }

      if (!result?.key) {
        setError("Couldn't create plugin");
        return false;
      }

      setKey(result.key);
      void addPluginToProjects(newPlugin, result.email);

      setDialogPage((page) => page + 1);
      return true;
    } catch (e) {
      setError("Couldn't create plugin");
      return false;
    }
  };

  const pickPluginTypeDialog = dialogPage === DialogPage.pickPluginType && (
    <Box>
      <FormControl
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, type: e.target.value } as IPluginOut));
        }}
      >
        <h3>What type of plug-in do you want to register?</h3>
        <RadioGroup value={newPlugin.type}>
          <FormLabelControl
            value={PluginType.Javascript}
            name="Javascript Plug-in"
            description="These plugins are client-side and run in the logged in users browser. The data is decrypted locally."
          />
          <FormLabelControl
            value={PluginType.Python}
            name="Python Plug-in"
            description={`These plugins are server-side, hosted and run by your team. 
            
            The data is decrypted on your server and the security of the decrypted data is your responsibility.
            `}
          />
          <FormLabelControl
            value={PluginType.AI}
            name="AI Plug-in"
            description={`These plugins are server-side, hosted and run by your team. 
            
            The data is decrypted on your server and the security of the decrypted data is your responsibility.`}
          />
        </RadioGroup>
      </FormControl>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between !important",
          marginTop: "30px",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => services.launchDocs()}
          text="Learn more"
        />
        <Button
          color="primary"
          variant="contained"
          onClick={() => setDialogPage((page) => page + 1)}
          text="Continue"
        />
      </Box>
    </Box>
  );

  const isValidURL = (url: string): boolean => {
    const pattern = new RegExp("^https?:\\/\\/");
    return pattern.test(url);
  };

  const enterValuesDialog = dialogPage === DialogPage.enterValues && (
    <>
      <TextField
        sx={{ ...marginTop }}
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
      <TextField
        sx={{ ...marginTop }}
        variant="outlined"
        placeholder="Plug-in URL"
        type="url"
        error={!validUrl}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const url = e.target.value.replace(/\/$/, ""); // remove trailing slash
          setValidUrl(isValidURL(url));
          setNewPlugin((p) => ({ ...p, url } as IPluginOut));
        }}
      />
      <Divider sx={{ ...divider }} />
      <ProductsRadioForm newPlugin={newPlugin} setNewPlugin={setNewPlugin} />
      <Divider sx={{ ...divider }} />
      <ProjectsAutocomplete
        allProjects={projects}
        plugin={newPlugin}
        setPlugin={setNewPlugin}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between !important",
          marginTop: "30px",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setDialogPage((page) => page - 1)}
          text="Back"
        />
        <Button
          variant="contained"
          color="primary"
          disabled={newPlugin.url === "" || newPlugin.name === "" || creating}
          onClick={() => {
            if (!validUrl) return;
            setCreating(true);
            void createPlugin().then((result: boolean) => {
              setCreating(false);
              if (result) {
                void getPlugins();
              }
            });
          }}
          text={creating ? "Loading..." : "Confirm"}
        />
      </Box>
    </>
  );

  const accessKeyDialog =
    key !== null && dialogPage === DialogPage.accessKey ? (
      <Paper elevation={0} square>
        <Typography sx={{ fontSize: "16px" }}>
          This is your trusted access key, it will only be shown once. If you
          need a new one, you can re-register the plugin.
        </Typography>
        <Typography
          sx={{
            width: "100%",
            overflowWrap: "anywhere",
            background: "#eee",
            padding: "8px",
            borderRadius: "5px",
            fontFamily: "monospace",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          {key}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setCloseDialog(true);
              resetDefaults();
            }}
            text="OK"
          />
        </Box>
      </Paper>
    ) : null;

  return (
    <>
      <Dialogue
        title="Add Plug-in"
        close={closeDialog}
        TriggerButton={
          <IconButton
            tooltip={{
              name: "Add New Plug-in",
            }}
            icon={icons.add}
            size="small"
            tooltipPlacement="top"
            id="add-plugin"
          />
        }
        afterClose={resetDefaults}
      >
        <Box sx={{ width: "350px" }}>
          {pickPluginTypeDialog}
          {enterValuesDialog}
          {accessKeyDialog}
        </Box>
      </Dialogue>
    </>
  );
}
