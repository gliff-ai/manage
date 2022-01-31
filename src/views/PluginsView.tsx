import { useEffect, useState, useCallback, ReactElement, useRef } from "react";
import {
  Paper,
  Typography,
  Card,
  makeStyles,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Switch,
  TableHead,
} from "@material-ui/core";

import { LoadingSpinner, theme } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";
import {
  AddPluginDialog,
  MessageAlert,
  DeletePluginDialog,
  EditPluginDialog,
} from "@/components";
import { IPlugin, PluginType, Project, JsPlugin } from "@/interfaces";

const useStyles = () =>
  makeStyles(() => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
    paperBody: {},
    projectsTopography: {
      color: "#000000",
      display: "inline",
      fontSize: "21px",
      marginRight: "125px",
    },
    // eslint-disable-next-line mui-unused-classes/unused-classes
    "@global": {
      '.MuiAutocomplete-option[data-focus="true"]': {
        background: "#01dbff",
      },
    },
    tableText: {
      fontSize: "16px",
      paddingLeft: "20px",
    },
    buttonsContainer: { position: "relative", float: "right", top: "-8px" },
    tableRow: {
      "&:hover": {
        backgroundColor: theme.palette.grey[200],
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
  }));

interface Props {
  services: ServiceFunctions;
}

export const PluginsView = ({ services }: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [plugins, setPlugins] = useState<IPlugin[] | null>(null);
  const [error, setError] = useState("");

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
  }, [isMounted, services]);

  const fetchPlugins = useCallback(async () => {
    const trustedService = (await services.getTrustedServices(
      null,
      auth.user.authToken
    )) as IPlugin[];

    const jsplugins = (await services.getJsPlugins(
      null,
      auth.user.authToken
    )) as JsPlugin[];

    const allPlugins = trustedService.concat(
      jsplugins.map((p) => ({ ...p, type: PluginType.Javascript } as IPlugin))
    );

    setStateIfMounted(allPlugins, setPlugins, isMounted.current);
  }, []);

  const updateEnabled = (currentPlugin: IPlugin) => {
    let updatedPlugin: IPlugin | null = null;
    setPlugins((prevPlugins) =>
      prevPlugins.map((p) => {
        const hasUpdated =
          p.name === currentPlugin.name && p.url === currentPlugin.url;
        if (hasUpdated) {
          updatedPlugin = {
            ...p,
            enabled: !p.enabled,
          };
          return updatedPlugin;
        }
        return p;
      })
    );
    if (updatedPlugin) {
      void services.updatePlugin({ ...updatedPlugin });
    }
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void fetchPlugins();
    }
  }, [auth, services, isMounted]);

  const tableHeader = (
    <TableRow>
      <TableCell className={classes.tableText}>Name</TableCell>
      <TableCell className={classes.tableText}>Type</TableCell>
      <TableCell className={classes.tableText}>URL</TableCell>
      <TableCell className={classes.tableText}>Products</TableCell>
      <TableCell className={classes.tableText}>Enabled</TableCell>
      <TableCell className={classes.tableText} />
    </TableRow>
  );

  const fillTableRow = (currPlugin: IPlugin) => {
    const { name, url, type, products, enabled } = currPlugin;
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
        <TableCell>
          <div className={classes.hiddenButtons}>
            <EditPluginDialog
              plugin={currPlugin}
              allProjects={projects}
              services={services}
              currentProjects={[]} // TODO: fetch current projects
            />
            <DeletePluginDialog
              services={services}
              plugin={currPlugin}
              currentProjects={[]} // TODO: fetch current projects
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
          <Typography
            className={classes.projectsTopography}
            style={{ marginLeft: "14px" }}
          >
            Plugins
          </Typography>
          <div className={classes.buttonsContainer}>
            <AddPluginDialog
              services={services}
              setError={setError}
              projects={projects}
            />
          </div>
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
      {error ? <MessageAlert message={error} severity="error" /> : null}
    </>
  );
};

PluginsView.defaultProps = {};
