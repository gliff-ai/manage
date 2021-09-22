import { HtmlTooltip } from "@gliff-ai/style";
import Button from "@material-ui/core/Button";
import { Launch } from "@material-ui/icons";
import { ReactElement } from "react";

interface Props {
  launchCallback: () => void | null;
  tooltip: string;
}

const LaunchIcon = (props: Props): ReactElement | null => {
  const { launchCallback, tooltip } = props;
  return (
    launchCallback && (
      <HtmlTooltip
        key={`tooltip-${tooltip.split(" ").join("-")}`}
        title={tooltip}
        placement="bottom"
      >
        <Button onClick={launchCallback}>
          <Launch />
        </Button>
      </HtmlTooltip>
    )
  );
};

export { LaunchIcon };
