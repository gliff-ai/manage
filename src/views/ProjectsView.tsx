import { useEffect, useState } from "react";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  services: ServiceFunctions;
}

type Project = {
  name: string;
};

export const ProjectsView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setProjectName(value);
  };

  useEffect(() => {
    if (auth?.user?.email) {
      console.log("auth");
      void props.services
        .getProjects(null, auth.user.accessToken)
        .then((p: Project[]) => {
          setProjects(p);
        });
    }
  }, [auth]);

  return !auth ? null : (
    <>
      <h1>Projects</h1>
      <input
        type="text"
        name="project-name"
        onChange={handleChange}
        value={projectName}
      />
      <button
        type="button"
        onClick={async () => {
          await props.services.createProject({ name: projectName });
          const p = await props.services.getProjects() as Project[];
          setProjects(p);
          setProjectName("");
        }}
      >
        New Project
      </button>
      <ul>
        {projects.map((project) => (
          <li key={project.name}>{project.name}</li>
        ))}
      </ul>
    </>
  );
};
