import { ReactElement, useState, ChangeEvent, useEffect } from "react";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Paper,
  TextField,
  Typography,
  DialogActions,
  RadioGroup,
  FormControl,
  Box,
  Divider,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import {
  theme,
  icons,
  lightGrey,
  middleGrey,
  IconButton as GliffIconButton,
} from "@gliff-ai/style";
import { IPlugin, Product, PluginType, Project } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { FormLabelControl } from "./FormLabelControl";
import { ProductsRadioForm } from "./ProductsRadioForm";
import { ProjectsAutocomplete } from "./ProjectsAutocomplete";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: `${theme.palette.primary.main} !important`,
    display: "flex",
    justifyContent: "space-between",
  },
  paperBody: { width: "350px", margin: "10px 20px" },
  topography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "8px",
  },
  key: {
    width: "100%",
    overflowWrap: "anywhere",
    background: "#eee",
    padding: "8px",
    borderRadius: "5px",
    fontFamily: "monospace",
  },
  whiteButton: {
    textTransform: "none",
    backgroundColor: "transparent",
    borderColor: `${middleGrey} !important`,
    "&:hover": {
      borderColor: middleGrey,
    },
  },
  greenButton: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    "&:disabled": {
      backgroundColor: lightGrey,
    },
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  dialogActions: {
    justifyContent: "space-between !important",
    marginTop: "30px",
  },
  closeIcon: { width: "15px", height: "auto" },
  textFontSize: { fontSize: "16px" },
  marginTop: { marginTop: "15px" },
  divider: { width: "500px !important", margin: "12px -20px !important" },
});

enum DialogPage {
  pickPluginType,
  enterValues,
  accessKey,
}

interface Props {
  projects: Project[] | null;
  services: ServiceFunctions;
  setError: (error: string) => void;
  getPlugins: () => Promise<void>;
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
  const [open, setOpen] = useState<boolean>(false);
  const [key, setKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dialogPage, setDialogPage] = useState(DialogPage.pickPluginType);
  const [newPlugin, setNewPlugin] = useState<IPlugin>(defaultPlugin);
  const [validUrl, setValidUrl] = useState<boolean>(true);

  const classes = useStyles();

  useEffect(() => {
    if (open) return;

    // reset some states
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
  }, [open, setError]);

  if (!projects) return null;

  const addPluginToProjects = async (plugin: IPlugin, email: string) => {
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
        setOpen(false);
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
          setNewPlugin((p) => ({ ...p, type: e.target.value } as IPlugin));
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
      <DialogActions className={classes.dialogActions}>
        <Button
          className={classes.whiteButton}
          variant="outlined"
          onClick={() => services.launchDocs()}
        >
          Learn more
        </Button>
        <Button
          variant="outlined"
          className={classes.greenButton}
          onClick={() => setDialogPage((page) => page + 1)}
        >
          Continue
        </Button>
      </DialogActions>
    </Box>
  );

  const isValidURL = (url: string): boolean => {
    const pattern = new RegExp("^https?:\\/\\/");
    return pattern.test(url);
  };

  const enterValuesDialog = dialogPage === DialogPage.enterValues && (
    <>
      <TextField
        className={classes.marginTop}
        placeholder="Plug-in Name"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, name: e.target.value } as IPlugin));
        }}
        inputProps={{
          maxLength: 50, // NOTE: name for python or AI plugins cannot be over 50 characters, otherwise 500
        }}
        variant="outlined"
      />
      <Divider className={classes.divider} />
      <TextField
        className={classes.marginTop}
        variant="outlined"
        placeholder="Plug-in URL"
        type="url"
        error={!validUrl}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setValidUrl(isValidURL(e.target.value));
          setNewPlugin((p) => ({ ...p, url: e.target.value } as IPlugin));
        }}
      />
      <Divider className={classes.divider} />
      <ProductsRadioForm newPlugin={newPlugin} setNewPlugin={setNewPlugin} />
      <Divider className={classes.divider} />
      <ProjectsAutocomplete
        allProjects={projects}
        plugin={newPlugin}
        setPlugin={setNewPlugin}
      />
      <DialogActions className={classes.dialogActions}>
        <Button
          variant="outlined"
          onClick={() => setDialogPage((page) => page - 1)}
          className={classes.whiteButton}
        >
          Back
        </Button>
        <Button
          variant="outlined"
          className={classes.greenButton}
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
        >
          {creating ? "Loading..." : "Confirm"}
        </Button>
      </DialogActions>
    </>
  );

  const accessKeyDialog =
    key !== null && dialogPage === DialogPage.accessKey ? (
      <Paper elevation={0} square>
        <p className={classes.textFontSize}>
          This is your trusted access key, it will only be shown once. If you
          need a new one, you can re-register the plugin.
        </p>
        <p className={classes.key}>{key}</p>

        <DialogActions>
          <Button
            className={classes.greenButton}
            onClick={() => setOpen(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Paper>
    ) : null;

  return (
    <>
      <GliffIconButton
        id="add-plugin"
        tooltip={{ name: "Add New Plug-in" }}
        icon={icons.add}
        onClick={() => setOpen(true)}
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
            <Typography className={classes.topography}>Add Plug-in</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {pickPluginTypeDialog}
            {enterValuesDialog}
            {accessKeyDialog}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
