import React, { useState, useEffect, useContext, createContext } from "react";

interface Props {
  children: React.ReactElement;
}

interface User {
  email: string;
  accessToken: string;
}

interface Context {
  user: User;
  // getUser: () => Promise<User>;
  saveUser: (email: string, accessToken: string) => void;
  // signin: (username: string, password: string) => Promise<User>;
  // signout: () => Promise<boolean>;
  // signup: (username: string, password: string) => Promise<User>;
}

const authContext = createContext<Context>(null);

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): Context => useContext(authContext);

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState<User>(null);

  const saveUser = (email: string, accessToken: string) => {
      setUser({email, accessToken});
  };
  // const getUser = (): Promise<User> => {
  //   const u = {
  //     email: "c@c9r.dev",
  //     accessToken: "temp",
  //   };
  //
  //   setUser(u);
  //   return u;
  // };

  // Login initally if we have a session
  useEffect(() => {
    // console.log("use ffext get user");
    //
    // void getUser();
  }, []);

  // Return the user object and auth methods
  return {
    user,
    saveUser
  };
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
export function ProvideAuth(props: Props): React.ReactElement {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>{props.children}</authContext.Provider>
  );
}
