import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { IconButton } from "@gliff-ai/style";
import { imgSrc } from "@/helpers";

const links = ["Projects", "Team", "Collaborators"] as const;

interface Props {
  page: Lowercase<typeof links[number]>;
}

export function PageSelector({ page }: Props): ReactElement {
  return (
    <div
      style={{
        flexGrow: 0,
        flexShrink: 0,
        marginLeft: "20px",
        marginRight: "20px",
      }}
    >
      <ButtonGroup orientation="vertical">
        {links.map((name) => {
          const link = name.toLowerCase();

          return (
            <IconButton
              key={name}
              component={Link}
              to={`../${link}`}
              tooltip={{ name }}
              icon={imgSrc(link)}
              fill={page === link}
            />
          );
        })}
      </ButtonGroup>
    </div>
  );
}
