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
      <h1>Users</h1>

      <ul>
        {users.map((user) => (
          <li key={user.email}>{user.email}</li>
        ))}
      </ul>
    </>
  );
};
