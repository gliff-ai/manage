import { ReactElement, useState, ChangeEvent, useEffect } from "react";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Typography,
  DialogActions,
  RadioGroup,
  FormControl,
  Box,
  Divider,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import SVG from "react-inlinesvg";
import { theme, icons } from "@gliff-ai/style";
import { IPlugin, Product, PluginType, Project } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { FormLabelControl } from "./FormLabelControl";
import { ProductsRadioForm } from "./ProductsRadioForm";
import { ProjectsAutocomplete } from "./ProjectsAutocomplete";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  paperBody: { width: "25vw", margin: "10px 20px" },
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
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  whiteButton: {
    textTransform: "none",
    backgroundColor: "transparent",
  },
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
  dialogActions: { justifyContent: "space-between", marginTop: "30px" },
  closeIcon: { width: "15px", height: "auto" },
  textFontSize: { fontSize: "16px" },
  marginTop: { marginTop: "15px" },
  divider: { width: "500px", margin: "12px -20px" },
});

enum DialogPage {
  pickPluginType,
  enterValues,
  accessKey,
}

interface Props {
  projects: Project[];
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
  const [addedToProjects, setAddedToProjects] = useState<Project[]>([]);

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
      setError("");
    }, 500);
  }, [open]);

  const createPlugin = async (): Promise<boolean> => {
    try {
      const result = await services.createPlugin({ ...newPlugin });

      if (newPlugin.type === PluginType.Javascript) {
        setOpen(false);
        return true;
      }

      if (!result) {
        setError("Couldn't create plugin");
        return false;
      }

      setKey(result as string);
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
            description="These plugins are client-side and run in each user's own browser with data decrypted locally."
          />
          <FormLabelControl
            value={PluginType.Python}
            name="Python Plug-in"
            description={`These plugins are server-side and run by your team on your own remote compute capacity.
            Security issue responsabilities become the server's team.`}
          />
          <FormLabelControl
            value={PluginType.AI}
            name="AI Plug-in"
            description={`These plugins are server-side and run by your team on your own remote compute capacity.
            Security issue responsabilities become the server's team.`}
          />
        </RadioGroup>
      </FormControl>
      <DialogActions className={classes.dialogActions}>
        <Button variant="outlined" className={classes.whiteButton}>
          {/* TODO: add onClick with link to docs */}
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

  const enterValuesDialog = dialogPage === DialogPage.enterValues && (
    <>
      <TextField
        className={classes.marginTop}
        variant="outlined"
        placeholder="Plug-in Name"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, name: e.target.value } as IPlugin));
        }}
      />
      <Divider className={classes.divider} />
      <TextField
        className={classes.marginTop}
        variant="outlined"
        placeholder="Plug-in URL"
        type="url"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, url: e.target.value } as IPlugin));
        }}
      />
      <Divider className={classes.divider} />
      <ProductsRadioForm newPlugin={newPlugin} setNewPlugin={setNewPlugin} />
      <Divider className={classes.divider} />
      <ProjectsAutocomplete
        allProjects={projects}
        currentProjects={addedToProjects}
        setProjects={setAddedToProjects}
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
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Add />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Card>
          <Paper
            className={classes.paperHeader}
            elevation={0}
            variant="outlined"
            square
          >
            <Typography className={classes.topography}>Add Plug-in</Typography>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
            >
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
