import { useEffect, useState, useCallback, ReactElement, useRef } from "react";
import {
  Paper,
  Typography,
  Card,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Switch,
  TableHead,
  ButtonGroup,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import {
  LoadingSpinner,
  theme,
  WarningSnackbar,
  IconButton,
  lightGrey,
  icons,
} from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";
import {
  AddPluginDialog,
  DeletePluginDialog,
  EditPluginDialog,
} from "@/components";
import { IPlugin, Project } from "@/interfaces";

const useStyles = () =>
  makeStyles(() => ({
    paperHeader: {
      backgroundColor: theme.palette.primary.main,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    topography: {
      color: "#000000",
      fontSize: "21px",
      marginLeft: "20px",
    },
    tableText: {
      fontSize: "16px",
      paddingLeft: "20px",
    },
    tableRow: {
      "&:hover": {
        backgroundColor: lightGrey,
      },
      "&:hover td div": {
        visibility: "visible",
      },
    },
    hiddenButtons: {
      visibility: "hidden",
      float: "right",
      marginRight: "20px",
    },
    boxButtons: { display: "flex", alignItems: "center" },
    buttonGroup: {
      backgroundColor: "transparent",
      border: "none",
      marginLeft: "10px",
    },
  }));

interface Props {
  services: ServiceFunctions;
}

export const PluginsView = ({ services }: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [plugins, setPlugins] = useState<IPlugin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(false);

  const classes = useStyles()();

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current || !auth?.user?.email) return;

    void services
      .getProjects(null, auth.user.authToken)
      .then((p: Project[]) =>
        setStateIfMounted(p, setProjects, isMounted.current)
      );
  }, [isMounted, services, auth]);

  const getPlugins = useCallback(async () => {
    if (!auth?.user?.email) return;
    const newPlugins = await services.getPlugins();

    setStateIfMounted(newPlugins, setPlugins, isMounted.current);
  }, [auth, services]);

  const updatePlugins = (prevPlugin: IPlugin, plugin: IPlugin) => {
    void services.updatePlugin({ ...plugin }).then((result) => {
      if (result && isMounted.current) {
        setPlugins((prevPlugins) =>
          prevPlugins.map((p) => (prevPlugin === p ? plugin : p))
        );
      }
    });
  };

  const updateEnabled = (plugin: IPlugin) => {
    const newPlugin: IPlugin = plugins.find(
      (p) => p.name === plugin.name && p.url === plugin.url
    );
    newPlugin.enabled = !newPlugin.enabled;

    if (newPlugin) {
      updatePlugins(plugin, newPlugin);
    }
  };

  useEffect(() => {
    if (!plugins) {
      void getPlugins();
    }
  }, [auth, isMounted, plugins, getPlugins]);

  const tableHeader = (
    <TableRow>
      <TableCell className={classes.tableText}>Name</TableCell>
      <TableCell className={classes.tableText}>Type</TableCell>
      <TableCell className={classes.tableText}>URL</TableCell>
      <TableCell className={classes.tableText}>Products</TableCell>
      <TableCell className={classes.tableText}>Enabled</TableCell>
      <TableCell className={classes.tableText}>Added to</TableCell>
      <TableCell className={classes.tableText} />
    </TableRow>
  );

  const fillTableRow = (currPlugin: IPlugin) => {
    const {
      name,
      url,
      type,
      products,
      enabled,
      collection_uids: collectionUids,
    } = currPlugin;
    return (
      <TableRow key={`${name}-${url}`} className={classes.tableRow}>
        <TableCell className={classes.tableText}>{name}</TableCell>
        <TableCell className={classes.tableText}>{type}</TableCell>
        <TableCell className={classes.tableText}>{url}</TableCell>
        <TableCell className={classes.tableText}>{products}</TableCell>
        <TableCell className={classes.tableText}>
          <Switch
            size="small"
            color="primary"
            checked={enabled}
            onChange={(e) => updateEnabled(currPlugin)}
          />
        </TableCell>
        <TableCell className={classes.tableText}>
          {collectionUids.length}&nbsp;projects
        </TableCell>
        <TableCell align="right">
          <div className={classes.hiddenButtons}>
            <EditPluginDialog
              plugin={currPlugin}
              allProjects={projects}
              updatePlugins={updatePlugins}
              services={services}
              setError={setError}
            />
            <DeletePluginDialog
              plugin={currPlugin}
              setPlugins={setPlugins}
              services={services}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  };

  if (!auth) return null;

  return (
    <>
      <Card style={{ width: "100%", height: "85vh", marginRight: "20px" }}>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.topography}>Plugins</Typography>
          <Box className={classes.boxButtons}>
            <SVG src={icons.betaStatus} width="auto" height="25px" />
            <ButtonGroup
              className={classes.buttonGroup}
              orientation="horizontal"
              size="small"
              variant="text"
            >
              <IconButton
                tooltip={{ name: "Docs" }}
                icon={icons.documentHelp}
                onClick={() => {
                  // TODO: add link to docs
                }}
                tooltipPlacement="top"
                size="small"
              />
              <AddPluginDialog
                services={services}
                setError={setError}
                projects={projects}
                getPlugins={getPlugins}
              />
            </ButtonGroup>
          </Box>
        </Paper>
        {plugins ? (
          <TableContainer>
            <Table>
              <TableHead>{tableHeader}</TableHead>
              <TableBody>{plugins.map(fillTableRow)}</TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box display="flex" height="100%">
            <LoadingSpinner />
          </Box>
        )}
      </Card>
      <WarningSnackbar
        open={error !== null}
        onClose={() => setError(null)}
        messageText={error}
      />
    </>
  );
};

PluginsView.defaultProps = {};
