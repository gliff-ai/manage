import { HtmlTooltip } from "@gliff-ai/style";
import Button, { ButtonProps } from "@mui/material/Button";
import { Launch } from "@mui/icons-material";
import { ReactElement } from "react";

interface Props extends ButtonProps {
  launchCallback: () => void | null;
  tooltip: string;
}

const LaunchIcon = ({
  launchCallback,
  tooltip,
  ...buttonProps
}: Props): ReactElement | null =>
  launchCallback && (
    <HtmlTooltip
      key={`tooltip-${tooltip.split(" ").join("-")}`}
      title={tooltip}
      placement="bottom"
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Button {...buttonProps} onClick={launchCallback}>
        <Launch />
      </Button>
    </HtmlTooltip>
  );
export { LaunchIcon };
