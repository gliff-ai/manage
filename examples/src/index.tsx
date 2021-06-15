import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { UserInterface } from "@/index";
import { Services } from "@/api";
import { ProvideAuth } from "@/hooks/use-auth";

const user = {
  email: "a@b.com",
  authToken: "22345",
};

const config = {
  // If defining services, you must define ALL of them as they are not merged with defaults!
  services: {
    queryTeam: () =>
      Promise.resolve({
        profiles: [
          { email: "user1@gliff.app", name: "Mike Jones" },
          { email: "user2@gliff.app", name: "John Smith"},
          { email: "user3@gliff.app", name: "Jane James" },
        ],
        pending_invites: [],
      }),
    loginUser: "GET /login",
    getProject: "GET /project",
    getUsers: "GET /users",
    getProjects: () => Promise.resolve([{ name: "Project 1", id: "1" }, { name: "Project 2", id: "2" }]),
    createProject: (data) => {
      return Promise.resolve([]);
    },
    inviteUser: (data): Promise<boolean> => {
      return Promise.resolve(true);
    },
    inviteToProject: (data): Promise<boolean> => {
      return Promise.resolve(true);
    },
  } as Services,
};

// We render it here under another route as this is how it will typically be used
ReactDOM.render(
  <ProvideAuth>
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/manage">MANAGE</Link>
      </nav>
      <br />
      <Routes>
        <Route path="/" element={<h1>HOME</h1>} />
        <Route
          path="manage/*"
          element={
            <UserInterface
              apiUrl="http://localhost:8000/django/api"
              user={user}
              services={config.services}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </ProvideAuth>,
  document.getElementById("react-container")
);
