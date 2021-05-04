import React from "react";

import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  services: ServiceFunctions;
}

export const UsersView = (props: Props) => {
  const auth = useAuth();

  console.log(auth);

  return (
    <>
      <h1>USERS</h1>
      <button type="button">Hello {auth?.user.email}</button>
      <button
        type="button"
        onClick={async () => {
          const teamList = await props.services.queryTeam();

          console.log(teamList);
        }}
      >
        Get Users
      </button>
    </>
  );
};
