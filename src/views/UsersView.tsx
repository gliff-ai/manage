import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

interface Props {
  services: ServiceFunctions;
}

interface Team {
  profiles: Array<{
    email: string;
  }>;
  pending_invites: Array<{
    email: string;
    sent_date: string;
  }>;
}

export const UsersView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [users, setUsers] = useState<Team>({
    profiles: [],
    pending_invites: [],
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((team: Team) => {
          setUsers(team);
        });
    }
  }, [auth]);

  if (!auth) return null;

  let pendingInvites;
  if (users?.pending_invites?.length > 0) {
    pendingInvites = (
      <ul>
        {users?.pending_invites.map(({ email, sent_date }) => (
          <li key={email}>
            {email} - {sent_date}
          </li>
        ))}
      </ul>
    );
  } else {
    pendingInvites = <>No Pending Invites</>;
  }

  return (
    <>
      <h1>Current Users</h1>

      <ul>
        {users?.profiles.map(({email}) => (
          <li key={email}>{email}</li>
        ))}
      </ul>

      <h1>Pending Invites</h1>
      {pendingInvites}

      {/*  TODO make component */}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setInviteMessage("");

          const result = await props.services.inviteUser({
            email: inviteEmail,
          });

          if (result) {
            setInviteEmail("");
            setInviteMessage("Invite was sent");
          } else {
            setInviteMessage("An error happened with the invite");
          }
        }}
      >
        <div>{inviteMessage}</div>
        <label htmlFor="invite-email">
          Invite new user:&nbsp;
          <input
            name="invite-email"
            type="email"
            onChange={handleChange}
            value={inviteEmail}
            required
          />
          <input type="submit" value="Invite" />
        </label>
      </form>
    </>
  );
};
