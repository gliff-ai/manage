import React, { Component, ReactNode, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

import { initApiRequest, Services, User } from "@/api";
import { UsersView } from "@/views/UsersView";
import { useAuth } from "@/hooks/use-auth";

const defaultServices = {
  queryTeam: "GET /team",
  loginUser: "POST /user/login",
} as Services;

interface Props {
  apiUrl: string;
  services?: Readonly<typeof defaultServices>;
  user?: User; // Optional mock user
}

const defaultProps = {
  services: defaultServices,
  user: undefined as User,
};

export function UserInterface(props: Props) {
  const auth = useAuth();

  // This loads all the services we use, which are either API requests, or functions that allow us to mock etc.
  let services = initApiRequest(props.apiUrl, props.services, null);

  useEffect(() => {
    if (!auth.user && props.user) { // Autologin if we've been passed a login
      const { email, accessToken } = props.user;
      auth.saveUser(email, accessToken);

      // Reload once we have an access token
      services = initApiRequest(props.apiUrl, props.services, accessToken);
    }

    console.log(auth);
  });

  return (
    <div>
      <h1>MANAGE</h1>
      <Link to=".">Home</Link>
      &nbsp;
      <Link to="users">Users</Link>
      &nbsp;
      <Link to="projects">Projects</Link>
      &nbsp;
      <br />
      <br />
      <br />
      <Routes>
        <Route path="users" element={<UsersView services={services} />} />
        <Route path="projects">
          <h1>PROJECTS</h1>
        </Route>
        <Route path=".">
          <h1>HOME</h1>
        </Route>
      </Routes>
    </div>
  );
}

UserInterface.defaultProps = defaultProps;

/*
Login (ete)
Logout (ete)

Get team members  (djanog)
Remove (revoke) team members (ete + django)?
Add (invite) Team Members

Create a Project (ete)
Invite user to project (ete)
List projects (ete) (open in CURATE?)
 */
