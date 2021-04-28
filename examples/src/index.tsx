import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { UserInterface } from "@/index";
import { Services } from "@/api";

const config = {
  // If defining services, you must define ALL of them as they are not merged with defaults!
  // These are actually the defaults, but are here to show what you can do!
  services: {
    queryUsers: "GET /user",
    loginUser: "GET /user/login",
  } as Services,
};


// We render it here under another route as this is how it will typically be used
ReactDOM.render(
  <BrowserRouter>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/manage">MANAGE</Link>
    </nav>
    <Routes>
      <Route path="/" element={<h1>HOME</h1>} />
      <Route
        path="manage/*"
        element={<UserInterface services={config.services} />}
      />
    </Routes>
  </BrowserRouter>,
  document.getElementById("react-container")
);
