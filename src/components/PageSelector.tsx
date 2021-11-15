import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import { IconButton } from "@gliff-ai/style";
import { imgSrc } from "@/helpers";
import { User } from "@/interfaces";

function NavLink({ name }: { name: string }): ReactElement {
  const link = name.toLowerCase();

  const location = useLocation();
  const path = useResolvedPath(link);
  const isActive =
    location.pathname.toLowerCase() === path.pathname.toLowerCase();

  return (
    <IconButton
      component={Link}
      to={`${link}`}
      tooltip={{ name }}
      icon={imgSrc(link)}
      fill={isActive}
    />
  );
}

export function PageSelector({ user }: { user: User }): ReactElement {
  let links;
  if (user.isOwner && user.tierID > 1) {
    links = ["Projects", "Team", "Collaborators", "Services"] as const;
  } else if (user.isOwner) {
    links = ["Projects", "Team", "Collaborators"] as const;
  } else {
    links = ["Projects"] as const;
  }

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
        {links.map((name) => (
          <NavLink name={name} key={name} />
        ))}
      </ButtonGroup>
    </div>
  );
}
