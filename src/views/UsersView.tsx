import { ChangeEvent, useEffect, useState } from "react";

import {Team} from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";


interface Props {
  services: ServiceFunctions;
}

export const UsersView = (props: Props): JSX.Element => {
  const auth = useAuth();

  const [team, setTeam] = useState<Team>({
    profiles: [],
    pending_invites: [],
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  if (!auth) return null;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((t: Team) => setTeam(t));
    }
  }, [auth]);

  let pendingInvites;
  if (team?.pending_invites?.length > 0) {
    pendingInvites = (
      <ul>
        {team?.pending_invites.map(({ email, sent_date }) => (
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
        {team?.profiles.map(({ email, name }) => (
          <li key={email}>{name}</li>
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
