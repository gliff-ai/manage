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
import {
  AddPluginDialog,
  DeletePluginDialog,
  EditPluginDialog,
  Table,
  TableCell,
  TableRow,
  TableButtonsCell,
} from "@/components";
import {
  PluginType,
  PluginWithExtra,
  Plugin,
  Project,
  CollectionUidsWithExtra,
} from "@/interfaces";

const useStyles = () =>
  makeStyles(() => ({
    paperHeader: {
      backgroundColor: `${theme.palette.primary.main} !important`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "50px",
    },
    topography: {
      color: "#000000",
      fontSize: "21px",
      marginLeft: "20px !important",
    },
    buttonGroup: {
      backgroundColor: "transparent !important",
      border: "none !important",
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

export interface PendingProjectInvites {
  [plugin_url: string]: string[]; // array of project uids for which an invite is still pending.
}

interface Props {
  services: ServiceFunctions;
  launchDocs: () => Window | null;
  rerender?: number;
}

export const PluginsView = ({
  services,
  launchDocs,
  rerender,
}: Props): ReactElement => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [plugins, setPlugins] = useState<Plugin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingProjectInvites, setPendingProjectInvites] =
    useState<PendingProjectInvites>({});

  const isMounted = useRef(false);

  const classes = useStyles()();

  const updatePlugins = (prevPlugin: Plugin, plugin: Plugin) => {
    void services.updatePlugin({ ...plugin }).then((result) => {
      if (result && isMounted.current) {
        setPlugins((prevPlugins) =>
          prevPlugins.map((p) => {
            if (prevPlugin === p && plugin.type !== PluginType.Javascript) {
              // update list of pending invites
              setPendingProjectInvites((prevValues: PendingProjectInvites) => {
                const newPendingProjectInvites = { ...prevValues };

                newPendingProjectInvites[plugin.url] = [
                  ...newPendingProjectInvites[plugin.url],
                  ...(plugin.collection_uids.filter(
                    (uid) => !prevPlugin.collection_uids.includes(uid)
                  ) || []),
                ];
                return newPendingProjectInvites;
              });

              return plugin;
            }
            return p;
          })
        );
      }
    });
  };

  const togglePluginButton = (
    plugin: Plugin,
    key: "enabled" | "is_public"
  ): void => {
    const newPlugin: Plugin = plugins.find(
      (p) => p.name === plugin.name && p.url === plugin.url
    );
    newPlugin[key] = !newPlugin[key];

    if (newPlugin) {
      updatePlugins(plugin, newPlugin);
    }
  };

  const getPlugins = useCallback(() => {
    if (!auth?.user?.email) return;
    void services.getPlugins().then((newPlugins: PluginWithExtra[]) => {
      const newPendingInvites: PendingProjectInvites = {};

      setPlugins(
        newPlugins.map((p: Plugin | PluginWithExtra): Plugin => {
          const unifiedPlugin: Plugin =
            p.type === PluginType.Javascript
              ? (p as Plugin)
              : {
                  ...p,
                  collection_uids: (
                    p.collection_uids as CollectionUidsWithExtra[]
                  ).map((d) => d.uid),
                };

          // if plugin is of type Python or AI, update pending invites
          if (p.type === PluginType.Python || p.type === PluginType.AI) {
            newPendingInvites[`${p.url}`] = (
              p.collection_uids as CollectionUidsWithExtra[]
            )
              .filter(({ is_invite_pending }) => is_invite_pending)
              .map(({ uid }) => uid);
          }

          return unifiedPlugin;
        })
      );
      setPendingProjectInvites(newPendingInvites);
    });
  }, [auth?.user?.email, services]);

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // fetch plugins (should run once at mount)
    getPlugins();
  }, [getPlugins, rerender]);

  useEffect(() => {
    // fetch projects (should run once at mount)
    if (!auth?.user?.authToken) return;
    void services.getProjects(null, auth.user.authToken).then(setProjects);
  }, [services, auth?.user?.authToken]);

  if (!auth || !services) return null;

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
              onClick={launchDocs}
              tooltipPlacement="top"
            />
            <AddPluginDialog
              services={services}
              setError={setError}
              projects={projects}
              getPlugins={getPlugins}
              launchDocs={launchDocs}
            />
          </ButtonGroup>
        </Paper>
        {plugins ? (
          <Table
            header={[
              "Name",
              "Type",
              "URL",
              "Author",
              "Products",
              "Added To",
              "Enabled",
              "Public",
            ]}
          >
            {plugins.map((iplugin) => {
              const {
                name,
                url,
                type,
                author,
                products,
                enabled,
                is_public: isPublic,
                collection_uids: collectionUids,
              } = iplugin;
              return (
                <TableRow key={`${name}-${url}`}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{type}</TableCell>
                  <TableCell>{url}</TableCell>
                  <TableCell>{author}</TableCell>
                  <TableCell>{products}</TableCell>
                  <TableCell>{collectionUids.length}&nbsp;projects</TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      color="primary"
                      checked={enabled}
                      onChange={(e) => togglePluginButton(iplugin, "enabled")}
                    />
                  </TableCell>
                  <TableCell>
                    {isPublic !== null && (
                      <Switch
                        size="small"
                        color="primary"
                        checked={isPublic}
                        onChange={(e) =>
                          togglePluginButton(iplugin, "is_public")
                        }
                      />
                    )}
                  </TableCell>
                  <TableButtonsCell>
                    <EditPluginDialog
                      plugin={iplugin}
                      allProjects={projects}
                      updatePlugins={updatePlugins}
                      services={services}
                      setError={setError}
                      pendingProjectInvites={pendingProjectInvites[url]}
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

PluginsView.defaultProps = {
  rerender: 0,
};
