import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { BaseIconButton } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";

const tooltips = {
  users: {
    name: "Users",
    icon: imgSrc("Users_Page"),
  },
  projects: {
    name: "Projects",
    icon: imgSrc("Projects_Page"),
  },
};

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
