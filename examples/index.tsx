import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserInterface, ProvideAuth } from "../src";
import { user, config } from "./samples";

// We render it here under another route as this is how it will typically be used
ReactDOM.render(
  <ProvideAuth>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/manage/projects" />} />
        <Route
          path="manage/*"
          element={
            <UserInterface
              apiUrl="http://localhost:8000/django/api"
              user={user}
              services={config.services}
              showAppBar
              launchDocs={() =>
                window.open("https://docs.gliff.app/", "_blank")
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </ProvideAuth>,
  document.getElementById("react-container")
);
