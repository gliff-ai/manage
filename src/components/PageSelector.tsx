import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { BaseIconButton } from "@gliff-ai/style";
import { imgSrc } from "@/imgSrc";

const tooltips = {
  projects: {
    name: "Projects",
    icon: imgSrc("projects"),
  },
  team: {
    name: "Team members",
    icon: imgSrc("team"),
  },
};

interface Props {
  page: "team" | "projects" | "collaborators";
}

export function PageSelector(props: Props): ReactElement {
  const navigate = useNavigate();

  return (
    <ButtonGroup>
      <BaseIconButton
        tooltip={tooltips.projects}
        active={props.page === "projects"}
        onClick={() => {
          navigate("/manage/projects");
        }}
      />
      <BaseIconButton
        tooltip={tooltips.team}
        active={props.page === "team"}
        onClick={() => {
          navigate("/manage/team");
        }}
      />
    </ButtonGroup>
  );
}
