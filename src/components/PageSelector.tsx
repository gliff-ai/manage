import { ButtonGroup } from "@material-ui/core";
import { BaseIconButton, ToolTip } from "./BaseIconButton";
import { useNavigate } from "react-router-dom";

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

interface Props {
  page: "users" | "projects";
}

export function PageSelector(props: Props) {
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
