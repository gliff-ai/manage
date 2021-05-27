import { useState, useContext, createContext, ReactElement } from "react";

interface Props {
  children: ReactElement;
}

interface User {
  email: string;
  accessToken: string;
}

interface Context {
  user: User;
  saveUser: (email: string, accessToken: string) => void;
}

const authContext = createContext<Context>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState<User>(null);

  const saveUser = (email: string, accessToken: string) => {
    setUser({ email, accessToken });
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
