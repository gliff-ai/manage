import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

interface Props {
  services: ServiceFunctions;
}

type User = {
  email: string;
  accessToken: string;
};

export const UsersView = (props: Props): JSX.Element => {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  useEffect(() => {
    if (auth?.user?.accessToken) {
      void props.services
        .queryTeam(null, auth.user.accessToken)
        .then((u: User[]) => {
          setUsers(u);
        });
    }
  }, [auth]);

  return !auth ? null : (
    <>
      <h1>Current Users</h1>

      <ul>
        {users.map((user) => (
          <li key={user.email}>{user.email}</li>
        ))}
      </ul>


        { /*  TODO make component */ }
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
