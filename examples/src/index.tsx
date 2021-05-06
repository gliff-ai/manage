import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { UserInterface } from "@/index";
import { Services } from "@/api";
import { ProvideAuth } from "@/hooks/use-auth";


import user from "../user.json";

const config = {
  // If defining services, you must define ALL of them as they are not merged with defaults!
  // These are actually the defaults, but are here to show what you can do!
  services: {
    // queryTeam: "GET /team",
    queryTeam: () => Promise.resolve(1),
    loginUser: "GET /login",
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
      <Routes>
        <Route path="/" element={<h1>HOME</h1>} />
        <Route
          path="manage/*"
          element={(
            <UserInterface
              apiUrl="http://localhost:8000/django/api"
              user={user}
              services={config.services}
            />
          )}
        />
      </Routes>
    </BrowserRouter>
  </ProvideAuth>,
  document.getElementById("react-container")
);
