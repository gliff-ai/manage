/* eslint-disable @typescript-eslint/require-await */
import ReactDOM from "react-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { fireEvent, screen, act } from "@testing-library/react";
import { ProvideAuth, UserInterface } from "./index";
import { user, config, getAnnotationProgress } from "../examples/samples";
import { UserAccess } from "./interfaces";

let container: HTMLDivElement;
const getComponent = (userAccess: UserAccess, tierID: number): JSX.Element => (
  <ProvideAuth>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/manage/projects" />} />
        <Route
          path="manage/*"
          element={
            <UserInterface
              apiUrl="http://localhost:8000/django/api"
              user={{ ...user, userAccess, tierID }}
              services={config.services}
              showAppBar
              getAnnotationProgress={getAnnotationProgress}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </ProvideAuth>
);

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe.each([UserAccess.Owner, UserAccess.Member])(
  "%ss access with tierID > 1",
  (userAccess) => {
    beforeEach(async () => {
      await act(async () => {
        ReactDOM.render(getComponent(userAccess, 2), container);
      });
    });

    test.each([
      ["Projects", "projects"],
      ["Team Members", "team"],
      ["Collaborators", "collaborators"],
      ["Trusted Services", "services"],
    ])("can access '%s' page", async (text: string, testId: string) => {
      expect(screen.queryByTestId(testId)).toBeDefined();
      await act(async () => {
        fireEvent.click(screen.queryByTestId(testId));
      });
      expect(screen.queryByText(text)).toBeDefined();
    });

    test("can launch a project's audit", async () => {
      await act(async () => {
        fireEvent.click(screen.queryByTestId("projects"));
      });
      expect(screen.queryAllByTestId(/audit-*/i)).not.toEqual([]);
    });

    test("can edit a project", async () => {
      await act(async () => {
        fireEvent.click(screen.queryByTestId("projects"));
      });
      expect(screen.queryAllByTestId(/edit-*/i)).not.toEqual([]);
    });
  }
);

describe.each([UserAccess.Owner, UserAccess.Member])(
  "%ss access with tierID <= 1",
  (userAccess) => {
    beforeEach(async () => {
      await act(async () => {
        ReactDOM.render(getComponent(userAccess, 1), container);
      });
    });

    test.each([["Trusted Services", "services"]])(
      "cannot access '%s' page",
      (_: string, testId: string) => {
        expect(screen.queryByTestId(testId)).toBeNull();
      }
    );

    test("cannot launch a project's audit", async () => {
      await act(async () => {
        fireEvent.click(screen.queryByTestId("projects"));
      });
      expect(screen.queryAllByTestId(/audit-*/i)).toEqual([]);
    });
  }
);

describe("collaborators access", () => {
  beforeEach(async () => {
    await act(async () => {
      ReactDOM.render(getComponent(UserAccess.Collaborator, 2), container);
    });
  });

  test.each([["Projects", "projects"]])(
    "can access '%s' page",
    async (text: string, testId: string) => {
      expect(screen.queryByTestId(testId)).toBeDefined();
      await act(async () => {
        fireEvent.click(screen.queryByTestId(testId));
      });
      expect(screen.queryByText(text)).toBeDefined();
    }
  );

  test.each([
    ["Team Members", "team"],
    ["Collaborators", "collaborators"],
    ["Trusted Services", "services"],
  ])("cannot access '%s' page", (_, testId: string) => {
    expect(screen.queryByTestId("projects")).toBeDefined();
    expect(screen.queryByTestId(testId)).toBeNull();
  });

  test("cannot launch a project's audit", async () => {
    await act(async () => {
      fireEvent.click(screen.queryByTestId("projects"));
    });
    expect(screen.queryAllByTestId(/audit-*/i)).toEqual([]);
  });

  test("cannot edit a project", async () => {
    await act(async () => {
      fireEvent.click(screen.queryByTestId("projects"));
    });
    expect(screen.queryAllByTestId(/edit-*/i)).toEqual([]);
  });
});
