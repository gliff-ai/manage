import React, {
  MouseEvent,
  ReactElement,
  CSSProperties,
  useState,
} from "react";
import {
  IconButton,
  Avatar,
  makeStyles,
  Box,
  Typography,
  Tooltip,
  TooltipProps,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import { theme } from "@/theme";

const useStyles = (props: Props) =>
  makeStyles({
    iconButton: { margin: "6px", padding: "0px" },
    svgLarge: { width: "55%", height: "auto" },
    popoverAvatar: {
      backgroundColor: theme.palette.primary.main,
      color: "#2B2F3A",
      width: "30px",
      height: "30px",
    },
    mainbox: {
      display: "flex",
      alignItems: "center",
      justifyItems: "space-between",
    },
    tooltip: {
      backgroundColor: "#FFFFFF",
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
      color: "#2B2F3A",
    },
    avatarFontSize: {
      fontSize: "11px",
      fontWeight: 600,
    },
    extraButtonStyling: { ...props.tooltip.styling },
  });

export interface ToolTip {
  name: string;
  icon: string;
  shortcut?: string;
  shortcutSymbol?: string;
  styling?: CSSProperties;
}

interface Props {
  tooltip: ToolTip;
  onClick?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  active: boolean;
  buttonSize?: "small" | "medium";
  buttonEdge?: "start" | "end";
  tooltipPlacement?: TooltipProps["placement"];
  setRefCallback?: (ref: HTMLButtonElement) => void;
}

export const BaseIconButton = (props: Props): ReactElement => {
  const classes = useStyles(props)();

  const [hover, setHover] = useState(false);

  return (
    <Tooltip
      key={props.tooltip.name}
      classes={{
        tooltip: classes.tooltip,
      }}
      title={
        <Box className={classes.mainbox}>
          <Box mr={3} ml={2}>
            <Typography>{props.tooltip.name}</Typography>
          </Box>
        </Box>
      }
      placement={props.tooltipPlacement}
    >
      <IconButton
        ref={(ref) => {
          if (!ref || !props.setRefCallback) return;
          props.setRefCallback(ref);
        }}
        className={
          props.tooltip?.styling
            ? `${classes.extraButtonStyling} ${classes.iconButton}`
            : classes.iconButton
        }
        onMouseUp={props.onMouseUp}
        onMouseDown={props.onMouseDown}
        onMouseOver={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        onClick={props.onClick}
        size={props.buttonSize}
        edge={props.buttonEdge}
      >
        <Avatar>
          <SVG
            src={props.tooltip.icon}
            className={classes.svgLarge}
            fill={props.active && !hover ? theme.palette.primary.main : null}
          />
        </Avatar>
      </IconButton>
    </Tooltip>
  );
};

BaseIconButton.defaultProps = {
  tooltipPlacement: "right",
  buttonSize: null,
  buttonEdge: null,
  setRefCallback: null,
  onMouseUp: null,
  onMouseDown: null,
  onClick: null,
};
