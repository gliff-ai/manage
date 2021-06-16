import { useEffect, useState, ChangeEvent } from "react";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Profile, Project, Team } from "@/interfaces";

interface Props {
  services: ServiceFunctions;
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
          setProjects(p);
        });

      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((team: Team) => {
          const invitees = team.profiles.filter(
            ({ email }) => email !== auth?.user?.email
          );
          setInvitees(invitees);
          if (invitees.length > 0) {
            setInvitee(invitees[0].email);
          }
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

  const project = ({ name, uid }: Project) => (
    <li key={name}>
      <div>{name}</div>
      <button
        type="button"
        onClick={() => inviteToProject(uid, projectInvitee)}
      >
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
