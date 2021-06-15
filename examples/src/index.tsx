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
    // queryTeam: "GET /team",
    queryTeam: () => Promise.resolve([]),
    loginUser: "GET /login",
    getProjects: "GET /projects",
    getUsers: "GET /users",
    getProject: "GET /projects",
    createProject: (data) => {
      return Promise.resolve([]);
    },
    inviteUser: (data): Promise<boolean> => {
      return Promise.resolve(true)
    }
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
