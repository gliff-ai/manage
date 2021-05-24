import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface Props {
  services: ServiceFunctions;
}

type Project = {
  name: string;
};

export const ProjectsView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  return (
    <>
      <h1>Projects</h1>

      <button
        type="button"
        onClick={async () => {
          const p = (await props.services.getProjects(
            null,
            auth.user.accessToken
          )) as Project[];

          console.log(p);

          setProjects(p);
        }}
      >
        Get Projects
      </button>

      {{ projects }}
    </>
  );
};
