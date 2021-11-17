import ReactDOM from "react-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { fireEvent, screen, act } from "@testing-library/react";
import { ProvideAuth, UserInterface } from "./index";
import { user, config } from "../examples/samples";

let container: HTMLDivElement;
const getComponent = (isOwner: boolean): JSX.Element => (
  <ProvideAuth>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/manage/projects" />} />
        <Route
          path="manage/*"
          element={
            <UserInterface
              apiUrl="http://localhost:8000/django/api"
              user={{ ...user, isOwner }}
              services={config.services}
              showAppBar
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

describe("owners access", () => {
  beforeEach(async () => {
    await act(async () => {
      ReactDOM.render(getComponent(true), container);
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
});

describe("collaborators access", () => {
  beforeEach(async () => {
    await act(async () => {
      ReactDOM.render(getComponent(false), container);
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
  ])("cannot access '%s' page", async (_, testId: string) => {
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
