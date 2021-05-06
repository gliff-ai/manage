import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  services: ServiceFunctions;
}

type User = {
  email: string;
  accessToken: string;
};

export const UsersView = (props: Props): JSX.Element => {
  const auth = useAuth();

  return (
    <>
      <h1>USERS</h1>
      <button type="button">
        Hello
        {auth?.user.email}
      </button>
      <button
        type="button"
        onClick={async () => {
          const team = (await props.services.queryTeam(
            null,
            auth.user.accessToken
          )) as User[];

          console.log(team);
        }}
      >
        Get Users
      </button>
    </>
  );
};
