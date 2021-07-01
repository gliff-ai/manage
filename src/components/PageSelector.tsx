import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { BaseIconButton } from "./BaseIconButton";

/* eslint-disable global-require */
const tooltips = {
  users: {
    name: "Users",
    icon: require("../assets/Users_Page.svg") as string,
  },
  projects: {
    name: "Projects",
    icon: require("../assets/Projects_Page.svg") as string,
  },
};
/* eslint-enable global-require */

interface Props {
  page: "users" | "projects";
}

export function PageSelector(props: Props): ReactElement {
  const navigate = useNavigate();

  return (
    <ButtonGroup>
      <BaseIconButton
        tooltip={tooltips.users}
        active={props.page === "users"}
        onClick={() => {
          navigate("/manage/users");
        }}
      />
      <BaseIconButton
        tooltip={tooltips.projects}
        active={props.page === "projects"}
        onClick={() => {
          navigate("/manage/projects");
        }}
      />
    </ButtonGroup>
  );
}
