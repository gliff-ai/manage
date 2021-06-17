import { useState, useContext, createContext, ReactElement } from "react";
import { User } from "@/interfaces";

interface Props {
  children: ReactElement;
}

interface Context {
  user: User;
  saveUser: (email: string, authToken: string) => void;
}

const authContext = createContext<Context>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState<User>(null);

  const saveUser = (email: string, authToken: string) => {
    setUser({ email, authToken });
  };

  // Return the user object and auth methods
  return {
    user,
    saveUser,
  };
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
export function ProvideAuth(props: Props): ReactElement {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>{props.children}</authContext.Provider>
  );
}
