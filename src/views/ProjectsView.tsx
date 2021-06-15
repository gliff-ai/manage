import { useEffect, useState, ChangeEvent } from "react";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  services: ServiceFunctions;
}

type Project = {
  id: string;
  name: string;
};

interface Profile {
  email: string;
  name: string;
}
interface Team {
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
  }>;
}

export const ProjectsView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectInvitee, setInvitee] = useState("");
  const [projectInvitees, setInvitees] = useState([]);

  if (!auth) return null;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setProjectName(value);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setInvitee(value);
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .getProjects(null, auth.user.authToken)
        .then((p: Project[]) => {
          console.log(p);
          setProjects(p);
        });

      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((team: Team) => {
          console.log("got team");
          console.log(team);
          setInvitees(
            team.profiles.filter(({ email }) => email !== auth?.user?.email)
          );
        });
    }
  }, [auth]);

  const inviteToProject = (projectId: string, inviteeEmail: string) => {
    if (!projectInvitee) return false;

    return props.services
      .inviteToProject({ projectId, email: inviteeEmail })
      .then(() => {
        console.log("invite complete!");
      });
  };

  const project = ({ name, id }: Project) => (
    <li key={name}>
      <div>{name}</div>
      <button type="button" onClick={() => inviteToProject(id, projectInvitee)}>
        Invite
      </button>
    </li>
  );

  const inviteSelect = (
    <select value={projectInvitee} onChange={handleSelectChange}>
      {projectInvitees.map((el: Profile) => (
        <option key={el.email} value={el.email}>
          {el.name}
        </option>
      ))}
    </select>
  );

  return (
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
          const p = (await props.services.getProjects()) as Project[];
          setProjects(p);
          setProjectName("");
        }}
      >
        New Project
      </button>

      <ul>{projects.map(project)}</ul>

      <h3>Invite user</h3>

      {inviteSelect}
    </>
  );
};
