import {
  ReactElement,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  theme,
  IconButton,
  icons,
  middleGrey,
  Dialog,
  Box,
  Button,
  Typography,
} from "@gliff-ai/style";
import { IPlugin } from "@/interfaces";
import { ServiceFunctions } from "@/api";

const purpleText = {
  color: theme.palette.info.light,
  fontWeight: 500,
  display: "inline",
};

const whiteButtonStyle = {
  textTransform: "none",
  backgroundColor: "transparent",
  borderColor: `${middleGrey} !important`,
  ":hover": {
    borderColor: middleGrey,
  },
};
const purpleButtonStyle = {
  backgroundColor: `${theme.palette.info.light} !important`,
  borderColor: `${theme.palette.info.light} !important`,
  textTransform: "none",
  color: "#FFFFFF",
  ":hover": {
    backgroundColor: theme.palette.info.light,
  },
};

interface Props {
  plugin: IPlugin;
  setPlugins: Dispatch<SetStateAction<IPlugin[]>>;
  services: ServiceFunctions;
}

export function DeletePluginDialog({
  plugin,
  services,
  setPlugins,
}: Props): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [closeDialog, setCloseDialog] = useState<boolean>(false);

  const [canDelete, setCanDelete] = useState<boolean>(false);

  const triggerDelete = () => {
    if (plugin.collection_uids.length > 0) {
      setOpen(true);
    } else {
      setCanDelete(true);
    }
  };

  useEffect(() => {
    if (closeDialog) {
      setCloseDialog(false);
    }
  }, [closeDialog]);

  useEffect(() => {
    if (canDelete) {
      void services.deletePlugin({ ...plugin }).then((result) => {
        if (result) {
          setPlugins((prevPlugins) => prevPlugins.filter((p) => p !== plugin));
        }
        setOpen(false);
      });
    }
  }, [canDelete, services, plugin, setPlugins]);

  useEffect(() => {
    if (!open) {
      setCanDelete(false);
    }
  }, [open]);

  return (
    <>
      <Dialog
        title="Are You Sure?"
        warningDialog
        close={closeDialog}
        TriggerButton={
          <IconButton
            tooltip={{
              name: "Delete",
            }}
            icon={icons.delete}
            size="small"
            tooltipPlacement="top"
            id={`delete-plugin-${plugin.name}`}
          />
        }
      >
        <Box sx={{ width: "450px" }}>
          <Typography sx={{ ...purpleText }}>{plugin.name}</Typography>
          &nbsp;plug-in is currently enabled in&nbsp;
          <Typography sx={{ ...purpleText }}>
            {plugin.collection_uids.length}
          </Typography>
          &nbsp;projects.
          <Typography>Do you want to delete this plug-in or cancel?</Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between !important",
              marginTop: "15px",
            }}
          >
            <Button
              variant="outlined"
              sx={{
                ...whiteButtonStyle,
              }}
              onClick={() => setCloseDialog(true)}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              sx={{
                ...purpleButtonStyle,
              }}
              onClick={() => {
                setCanDelete(true);
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
