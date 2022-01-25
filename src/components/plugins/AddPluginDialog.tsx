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
  FormControlLabel,
  Checkbox,
  RadioGroup,
  FormControl,
  Box,
  Radio,
  Avatar,
  Chip,
  List,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Add } from "@material-ui/icons";
import SVG from "react-inlinesvg";
import { theme, icons } from "@gliff-ai/style";
import { IPlugin, Product, PluginType, Project } from "@/interfaces";
import { ServiceFunctions } from "@/api";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  addButton: {
    color: "black",
  },
  projectsTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
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
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  formControl: { alignItems: "flex-start" },
  radio: { marginRight: "15px" },
  dialogActions: { justifyContent: "space-between", marginTop: "30px" },
  checkboxIcon: { width: "18px", height: "auto" },
  radioName: { fontSize: "16px", lineHeight: 0 },
  radioDescription: { fontSize: "14px", color: theme.palette.text.hint },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderColor: "black",
    borderRadius: "9px",
  },
  closeIcon: { width: "15px", height: "auto" },
  textFontSize: { fontSize: "16px" },
  productRadioName: { fontSize: "16px", lineHeight: 0, fontWeight: 400 },
  marginTop: { marginTop: "15px" },
  checkedIcon: {
    fill: "white",
    borderRadius: "3px",
    backgroundColor: theme.palette.primary.main,
  },
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
}: Props): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [key, setKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dialogPage, setDialogPage] = useState(DialogPage.pickPluginType);
  const [newPlugin, setNewPlugin] = useState<IPlugin>(defaultPlugin);
  const [addedToProjects, setAddedToProjects] = useState<Project[]>([]);

  const classes = useStyles();

  const createJsPlugin = async (): Promise<void> => {
    try {
      const { type, products, ...rest } = newPlugin;
      await services.createJsPlugin({
        products: String(products),
        ...rest,
      });
    } catch (e) {
      setError("Couldn't create plugin");
    }
  };

  const createTrustedService = async (): Promise<unknown> => {
    try {
      const { type, products, ...rest } = newPlugin;
      const tsKey = await services.createTrustedService({
        type: String(type),
        products: String(products),
        ...rest,
      });
      if (!tsKey) {
        setError("Couldn't create plugin");
      }
      return tsKey;
    } catch (e) {
      setError("Couldn't create plugin");
      return null;
    }
  };

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
    }, 500);
  }, [open]);

  const createPlugin = async () => {
    setCreating(true);

    if (newPlugin.type === PluginType.Javascript) {
      // create new plugin
      await createJsPlugin();
      setOpen(false);
    } else {
      // create new trusted service
      const res = await createTrustedService();
      if (res) {
        setKey(res as string);
      }
    }

    setCreating(false);
    setDialogPage((page) => page + 1);
  };

  const getPluginFormLabelControl = (
    value: unknown,
    name: string,
    description: string,
    nameStyling?: string,
    descriptionStyling?: string
  ): ReactElement => (
    <FormControlLabel
      className={classes.formControl}
      control={
        <Radio
          icon={
            <SVG
              className={classes.checkboxIcon}
              src={icons.notSelectedTickbox}
            />
          }
          checkedIcon={
            <SVG
              className={`${classes.checkboxIcon} ${classes.checkedIcon}`}
              src={icons.multipleImageSelection}
            />
          }
          className={classes.radio}
          value={value}
        />
      }
      label={
        <>
          <h3 className={nameStyling || classes.radioName}>{name}</h3>
          <p className={descriptionStyling || classes.radioDescription}>
            {description}
          </p>
        </>
      }
    />
  );

  const pickPluginTypeDialog = dialogPage === DialogPage.pickPluginType && (
    <Box>
      <FormControl
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, type: e.target.value } as IPlugin));
        }}
      >
        <h3>What type of plug-in do you want to register?</h3>
        <RadioGroup value={newPlugin.type}>
          {getPluginFormLabelControl(
            PluginType.Javascript,
            "Javascript Plug-in",
            "These plugins are client-side and run in each user's own browser with data decrypted locally."
          )}
          {getPluginFormLabelControl(
            PluginType.Python,
            "Python Plug-in",
            `These plugins are server-side and run by your team on your own remote compute capacity.
            Security issue responsabilities become the server's team.`
          )}
          {getPluginFormLabelControl(
            PluginType.AI,
            "AI Plug-in",
            `These plugins are server-side and run by your team on your own remote compute capacity.
            Security issue responsabilities become the server's team.`
          )}
        </RadioGroup>
      </FormControl>
      <DialogActions className={classes.dialogActions}>
        <Button variant="contained" className={classes.whiteButton}>
          {/* TODO: add onClick with link to docs */}
          Learn more
        </Button>
        <Button
          variant="contained"
          color="primary"
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
        placeholder="Plug-in Name"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, name: e.target.value } as IPlugin));
        }}
      />
      <TextField
        className={classes.marginTop}
        placeholder="Plug-in URL"
        type="url"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setNewPlugin((p) => ({ ...p, url: e.target.value } as IPlugin));
        }}
      />
      <FormControl
        className={classes.marginTop}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          console.log(e.target.value);
          setNewPlugin((p) => ({ ...p, products: e.target.value } as IPlugin));
        }}
      >
        <p className={classes.textFontSize}>Add plugin to:</p>
        <RadioGroup value={newPlugin.products}>
          {getPluginFormLabelControl(
            Product.CURATE,
            "CURATE plug-in toolbar",
            "",
            classes.productRadioName
          )}
          {getPluginFormLabelControl(
            Product.ANNOTATE,
            "ANNOTATE plug-in toolbar",
            "",
            classes.productRadioName
          )}
          {getPluginFormLabelControl(
            Product.ALL,
            "ALL plug-in toolbars",
            "",
            classes.productRadioName
          )}
        </RadioGroup>
      </FormControl>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        className={classes.marginTop}
        multiple
        disableCloseOnSelect
        disableClearable
        value={addedToProjects}
        onChange={(e: ChangeEvent<HTMLSelectElement>, value: Project[]) => {
          console.log(value);
          setAddedToProjects(value);
        }}
        renderTags={(option) => null}
        options={projects}
        getOptionLabel={(option) => option.name}
        renderOption={(option) => (
          <>
            <Checkbox
              icon={<div style={{ width: "10px", height: "auto" }} />}
              checkedIcon={
                <SVG
                  className={classes.checkboxIcon}
                  src={icons.multipleImageSelection}
                />
              }
              checked={addedToProjects.includes(option)}
            />
            {option.name}
          </>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Add Plug-in to Projects"
          />
        )}
      />
      <List>
        {addedToProjects?.map((project) => (
          <Chip
            variant="outlined"
            key={project.name}
            className={classes.chipLabel}
            label={project.name}
            avatar={
              <Avatar
                variant="circular"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setAddedToProjects((prevProjects) =>
                    prevProjects.filter((p) => p !== project)
                  )
                }
              >
                <SVG
                  fill="inherit"
                  className={classes.closeIcon}
                  src={icons.removeLabel}
                />
              </Avatar>
            }
          />
        ))}
      </List>

      <DialogActions className={classes.dialogActions}>
        <Button
          variant="contained"
          onClick={() => setDialogPage((page) => page - 1)}
          className={classes.whiteButton}
        >
          Back
        </Button>
        <Button
          className={classes.greenButton}
          variant="contained"
          color="primary"
          disabled={newPlugin.url === "" || newPlugin.name === "" || creating}
          onClick={createPlugin}
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
      <IconButton className={classes.addButton} onClick={() => setOpen(true)}>
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
            <Typography className={classes.projectsTopography}>
              Add Plug-in
            </Typography>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
            >
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper elevation={0} square style={{ width: "25vw", margin: "20px" }}>
            {pickPluginTypeDialog}
            {enterValuesDialog}
            {accessKeyDialog}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
