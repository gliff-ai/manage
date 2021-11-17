import { HtmlTooltip } from "@gliff-ai/style";
import Button, { ButtonProps } from "@material-ui/core/Button";
import { Launch } from "@material-ui/icons";
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
