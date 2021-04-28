import React, { Component, ReactNode } from "react";
import { Routes, Route, Link } from "react-router-dom";

import { initApiRequest, ServiceFunctions, Services } from "@/api";

const defaultServices = {
  queryUsers: "GET /users",
  loginUser: "POST /user/login",
} as Services;

interface Props {
  apiUrl: string;
  services: Readonly<typeof defaultServices>;
}

const defaultProps = {
  apiUrl: "http://localhost:8000/",
  services: defaultServices,
};

export class UserInterface extends Component<Props> {
  static defaultProps = defaultProps;

  services: ServiceFunctions;

  constructor(props: Props) {
    super(props);

    // This loads all the services we use, which are either API requests, or functions that allow us to mock etc.
    this.services = initApiRequest(props.apiUrl, props.services);
  }

  render = (): ReactNode => (
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
        <Route
          path="users"
          element={
            <>
              <h1>USERS</h1>
              <button type="button">Hello</button>
              <button
                type="button"
                onClick={async () => {
                  console.log(this.services);
                  const users = await this.services.loginUser("test");
                  console.log(users);
                  console.log("query users");
                  const userList = await this.services.queryUsers();
                  console.log(userList);
                }}
              >
                Get Users
              </button>
            </>
          }
        />
        <Route path="projects">
          <h1>PROJECTS</h1>
        </Route>
        <Route path=".">
          <h1>HOME</h1>
        </Route>
        <Route path="/never" element={<h1>never</h1>} />
      </Routes>
    </div>
  );
}

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
