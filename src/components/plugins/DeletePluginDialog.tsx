import {
  ReactElement,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import {
  theme,
  IconButton,
  icons,
  lightGrey,
  Box,
  Button,
  Typography,
  AdvancedDialog,
} from "@gliff-ai/style";
import { IPluginOut } from "@/interfaces";
import { ServiceFunctions } from "@/api";

const purpleText = {
  color: theme.palette.info.light,
  fontWeight: 500,
  display: "inline",
};

const whiteButtonStyle = {
  textTransform: "none",
  backgroundColor: "transparent",
  borderColor: `${lightGrey} !important`,
  ":hover": {
    borderColor: lightGrey,
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
  plugin: IPluginOut;
  setPlugins: Dispatch<SetStateAction<IPluginOut[]>>;
  services: ServiceFunctions;
}

export function DeletePluginDialog({
  plugin,
  services,
  setPlugins,
}: Props): ReactElement {
  const [open, setOpen] = useState<boolean>(false);

  const [canDelete, setCanDelete] = useState<boolean>(false);

  const triggerDelete = () => {
    if (plugin.collection_uids.length > 0) {
      setOpen(true);
    } else {
      setCanDelete(true);
    }
  };

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

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <IconButton
        tooltip={{
          name: "Delete",
        }}
        icon={icons.delete}
        size="small"
        tooltipPlacement="top"
        id={`delete-plugin-${plugin.name}`}
        onClick={triggerDelete}
      />
      <AdvancedDialog
        title="Are You Sure?"
        open={open}
        warningDialog
        onClose={onClose}
      >
        <Box sx={{ width: "400px" }}>
          <span style={{ fontSize: "16px", lineHeight: "1px" }}>
            <Typography sx={{ ...purpleText }}>{plugin.name}</Typography>
            &nbsp;plug-in is currently enabled in&nbsp;
            <Typography sx={{ ...purpleText }}>
              {plugin.collection_uids.length}
            </Typography>
            &nbsp;projects.
          </span>
          <Typography>Do you want to delete this plug-in or cancel?</Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between !important",
              marginTop: "20px",
            }}
          >
            <Button
              variant="outlined"
              sx={{
                ...whiteButtonStyle,
              }}
              onClick={() => setOpen(false)}
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
      </AdvancedDialog>
    </>
  );
}
