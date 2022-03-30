import { useEffect, useState, useCallback, ReactElement, useRef } from "react";
import {
  Paper,
  Typography,
  Card,
  Box,
  Switch,
  ButtonGroup,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import {
  LoadingSpinner,
  theme,
  WarningSnackbar,
  IconButton,
  icons,
} from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";
import {
  AddPluginDialog,
  DeletePluginDialog,
  EditPluginDialog,
  Table,
  TableCell,
  TableRow,
  TableButtonsCell,
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
    buttonGroup: {
      backgroundColor: "transparent !important",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
      marginRight: "15px",
      "& span button div": {
        backgroundColor: "transparent !important",
        // TODO: change IconButton backgroundColor from inherit to transparent
      },
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
          <ButtonGroup
            className={classes.buttonGroup}
            orientation="horizontal"
            size="small"
            variant="text"
          >
            <SVG
              src={icons.betaStatus}
              style={{ width: "auto", height: "25px", marginRight: "10px" }}
            />
            <IconButton
              tooltip={{ name: "Docs" }}
              icon={icons.documentHelp}
              onClick={() => {
                // TODO: add link to docs
              }}
              tooltipPlacement="top"
            />
            <AddPluginDialog
              services={services}
              setError={setError}
              projects={projects}
              getPlugins={getPlugins}
            />
          </ButtonGroup>
        </Paper>
        {plugins ? (
          <Table
            header={[
              "Name",
              "Type",
              "Product",
              "Products",
              "Enabled",
              "Added To",
            ]}
          >
            {plugins.map((iplugin) => {
              const {
                name,
                url,
                type,
                products,
                enabled,
                collection_uids: collectionUids,
              } = iplugin;
              return (
                <TableRow key={`${name}-${url}`}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{type}</TableCell>
                  <TableCell>{url}</TableCell>
                  <TableCell>{products}</TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      color="primary"
                      checked={enabled}
                      onChange={(e) => updateEnabled(iplugin)}
                    />
                  </TableCell>
                  <TableCell>{collectionUids.length}&nbsp;projects</TableCell>
                  <TableButtonsCell>
                    <EditPluginDialog
                      plugin={iplugin}
                      allProjects={projects}
                      updatePlugins={updatePlugins}
                      services={services}
                      setError={setError}
                    />
                    <DeletePluginDialog
                      plugin={iplugin}
                      setPlugins={setPlugins}
                      services={services}
                    />
                  </TableButtonsCell>
                </TableRow>
              );
            })}
          </Table>
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
