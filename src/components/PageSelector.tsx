import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import { IconButton, icons } from "@gliff-ai/style";
import { User, UserAccess } from "@/interfaces";

const pageIcons: { [name: string]: string } = {
  projects: icons.projectsPage,
  team: icons.usersPage,
  collaborators: icons.collaborators,
  plugins: icons.plugins,
};

function NavLink({ name }: { name: string }): ReactElement {
  const link = name.toLowerCase();

  const location = useLocation();
  const path = useResolvedPath(link);
  const isActive =
    location.pathname.toLowerCase() === path.pathname.toLowerCase();

  return (
    <IconButton
      component={Link}
      data-testid={link}
      to={`${link}`}
      tooltip={{ name }}
      icon={pageIcons[link]}
      fill={isActive}
    />
  );
}

export function PageSelector({ user }: { user: User }): ReactElement {
  let links;

  const isOwnerOrMember =
    user.userAccess === UserAccess.Owner ||
    user.userAccess === UserAccess.Member;

  if (isOwnerOrMember && user.tierID > 1) {
    links = ["Projects", "Team", "Collaborators", "Plugins"] as const;
  } else if (isOwnerOrMember) {
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
