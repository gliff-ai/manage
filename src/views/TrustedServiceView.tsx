import { useEffect, useState, ReactElement, useRef } from "react";
import {
  Paper,
  Typography,
  Card,
  List,
  ListItem,
  Dialog,
  TextField,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";


import makeStyles from '@mui/styles/makeStyles';

import { Add } from "@mui/icons-material";

import { LoadingSpinner, theme, WarningSnackbar } from "@gliff-ai/style";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { TrustedService } from "@/interfaces";
import { setStateIfMounted } from "@/helpers";

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
    cancelButton: {
      textTransform: "none",
    },
    OKButton: {
      "&:hover": {
        backgroundColor: theme.palette.info.main,
      },
    },

    key: {
      width: "100%",
      overflowWrap: "anywhere",
      background: "#eee",
      padding: "8px",
      borderRadius: "5px",
      fontFamily: "monospace",
    },
    // eslint-disable-next-line mui-unused-classes/unused-classes
    "@global": {
      '.MuiAutocomplete-option[data-focus="true"]': {
        background: "#01dbff",
      },
    },
    tableCell: {
      padding: "0px 16px 0px 25px",
      fontSize: "16px",
      height: "64px",
    },
  }));

interface Props {
  services: ServiceFunctions;
}

export const TrustedServiceView = (props: Props): ReactElement => {
  const auth = useAuth();
  const [newTrustedService, setNewTrustedService] = useState<{
    name: string;
    url: string;
  }>({ name: "", url: "" });
  const [trustedServices, setTrustedServices] =
    useState<TrustedService[] | null>(null); // all trustedServices
  const [dialogOpen, setDialogOpen] = useState(false); // New Project dialog
  const [creating, setCreating] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const classes = useStyles()();
  const isMounted = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .getTrustedServices(null, auth.user.authToken)
        .then((ts: TrustedService[]) => {
          setStateIfMounted(ts, setTrustedServices, isMounted.current);
        });
    }
  }, [auth, props.services, key, isMounted]);

  const createTrustedService = async (): Promise<unknown> => {
    try {
      const tsKey = await props.services.createTrustedService(
        newTrustedService
      );

      return tsKey;
    } catch (e: any) {
      setOpen(true);
      console.error(`${(e as Error).message}`);
      return null;
    }
  };

  const trustedService = ({ name, base_url }: TrustedService) => (
    <TableRow key={name}>
      <TableCell className={classes.tableCell}>{name}</TableCell>
      <TableCell className={classes.tableCell}>{base_url}</TableCell>
      <TableCell className={classes.tableCell} align="right" />
    </TableRow>
  );

  const keyDialog = (
    <Dialog open={key !== null} onClose={() => setKey(null)}>
      <Card>
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.projectsTopography}>
            Trusted Service Access Key
          </Typography>
        </Paper>
        <Paper elevation={0} square style={{ width: "20vw", margin: "20px" }}>
          <>
            <p>
              This is your trusted access key, it will only be shown once. If
              you need a new one, you can re-add the trusted service.
            </p>
            <p className={classes.key}>{key}</p>

            <Button
              onClick={() => {
                setKey(null);
              }}
              className={classes.OKButton}
            >
              OK
            </Button>
          </>
        </Paper>
      </Card>
    </Dialog>
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
            Trusted Services
          </Typography>
        </Paper>
        {trustedServices ? (
          <Paper elevation={0} square>
            <List style={{ paddingBottom: "0px" }}>
              <ListItem
                divider
                style={{ padding: "0px 0px 0px 10px", cursor: "pointer" }}
                onClick={() => {
                  setDialogOpen(!dialogOpen);
                }}
              >
                <div
                  style={{
                    margin: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Add
                    fontSize="large"
                    style={{ marginRight: "10px", color: "grey" }}
                  />
                  <Typography style={{ color: "grey" }}>
                    Add New Trusted Service
                  </Typography>
                </div>
              </ListItem>
            </List>

            <TableContainer>
              <Table aria-label="simple table">
                <TableBody>{trustedServices.map(trustedService)}</TableBody>
              </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <Card>
                <Paper
                  elevation={0}
                  variant="outlined"
                  square
                  className={classes.paperHeader}
                >
                  <Typography className={classes.projectsTopography}>
                    New Trusted Service
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  square
                  style={{ width: "20vw", margin: "20px" }}
                >
                  <TextField
                    placeholder="Trusted Service Name"
                    style={{ width: "100%" }}
                    onChange={(event) => {
                      setNewTrustedService({
                        name: event.target.value,
                        url: newTrustedService.url,
                      });
                    }}
                  />
                  <TextField
                    placeholder="Url"
                    type="url"
                    style={{ width: "100%" }}
                    onChange={(event) => {
                      setNewTrustedService({
                        url: event.target.value,
                        name: newTrustedService.name,
                      });
                    }}
                  />

                  <DialogActions>
                    <Button
                      onClick={() => {
                        setDialogOpen(false);
                      }}
                      className={classes.cancelButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={classes.OKButton}
                      variant="contained"
                      color="primary"
                      disabled={
                        newTrustedService.url === "" ||
                        newTrustedService.name === "" ||
                        creating
                      }
                      onClick={() => {
                        setCreating(true);
                        void createTrustedService().then((res) => {
                          if (res) {
                            setKey(res as string);
                          }
                          setDialogOpen(false);
                          setCreating(false);
                        });
                      }}
                    >
                      {!creating ? "Create" : "Loading..."}
                    </Button>
                  </DialogActions>
                </Paper>
              </Card>
            </Dialog>
          </Paper>
        ) : (
          <Box display="flex" height="100%">
            <LoadingSpinner />
          </Box>
        )}
      </Card>

      {keyDialog}

      <WarningSnackbar
        open={open}
        onClose={() => setOpen(false)}
        messageText="Couldn't create trusted service"
      />
    </>
  );
};

TrustedServiceView.defaultProps = {};
