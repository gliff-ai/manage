import { ReactElement, ReactNode } from "react";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import { IconButton, ButtonGroup, icons, MuiCard } from "@gliff-ai/style";
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
      id={link}
      data-testid={link}
      to={`${link}`}
      tooltip={{ name }}
      icon={pageIcons[link]}
      fill={isActive}
    />
  );
}

interface Props {
  user: User;
  ZooDialog: ReactNode;
}

export function PageSelector({ user, ZooDialog }: Props): ReactElement {
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 0,
        flexShrink: 0,
        marginLeft: "20px",
        marginRight: "20px",
      }}
    >
      <ButtonGroup orientation="vertical" variant="text">
        {links.map((name) => (
          <NavLink name={name} key={name} />
        ))}
      </ButtonGroup>
      {ZooDialog && (
        <MuiCard
          variant="outlined"
          sx={{
            borderRadius: "9px",
            "& > span > button": {
              minWidth: "57px !important",
            },
          }}
        >
          {ZooDialog}
        </MuiCard>
      )}
    </div>
  );
}
