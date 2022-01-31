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
} from "@material-ui/core";

import { LoadingSpinner, theme } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { setStateIfMounted } from "@/helpers";
import { AddPluginDialog, MessageAlert } from "@/components";
import { IPlugin, PluginType, Project, JsPlugin } from "@/interfaces";

const useStyles = () =>
  makeStyles(() => ({
    paperHeader: {
      padding: "10px",
      backgroundColor: theme.palette.primary.main,
    },
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
    tableHeader: {
      paddingLeft: "20px",
      fontSize: "16px",
      fontWeight: 700,
    },
    tableCell: {
      paddingLeft: "20px",
      fontSize: "16px",
    },
    buttonsContainer: { position: "relative", float: "right", top: "-8px" },
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

  useEffect(() => {
    if (auth?.user?.email) {
      void fetchPlugins();
    }
  }, [auth, services, isMounted]);

  const tableHeader = (
    <TableRow>
      <TableCell className={classes.tableHeader}>Name</TableCell>
      <TableCell className={classes.tableHeader}>Type</TableCell>
      <TableCell className={classes.tableHeader}>URL</TableCell>
      <TableCell className={classes.tableHeader}>Products</TableCell>
      <TableCell className={classes.tableHeader}>Enabled</TableCell>
      <TableCell className={classes.tableHeader} align="right" />
    </TableRow>
  );

  const fillTableRow = ({ name, url, type, enabled, products }: IPlugin) => (
    <TableRow key={`${name}-${url}`}>
      <TableCell className={classes.tableCell}>{name}</TableCell>
      <TableCell className={classes.tableCell}>{type}</TableCell>
      <TableCell className={classes.tableCell}>{url}</TableCell>
      <TableCell className={classes.tableCell}>{products}</TableCell>
      <TableCell className={classes.tableCell}>
        <Switch
          color="primary"
          checked={enabled}
          onChange={
            () =>
              setPlugins((prevPlugins) =>
                prevPlugins.map((p) =>
                  p.name === name && p.url === url
                    ? {
                        ...p,
                        enabled: !enabled,
                      }
                    : p
                )
              )
            // TODO: save changes
          }
          size="small"
        />
      </TableCell>
      <TableCell className={classes.tableCell} align="right" />
    </TableRow>
  );

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
          <Paper elevation={0} square>
            <TableContainer>
              <Table aria-label="simple table">
                <TableBody>
                  {tableHeader}
                  {plugins.map(fillTableRow)}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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
