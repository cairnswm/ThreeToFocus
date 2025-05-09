import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  ReactNode,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useJwt } from "react-jwt";
import { useTenant } from "../hooks/useTenant";
import useDeviceInfo from "../hooks/useDeviceInfo";
import { combineUrlAndPath } from "../utils/combineUrlAndPath";
import useEventing from "../hooks/useEventing";
import { REACT_APP_AUTH_API } from "../../env";

export type User = {
  email: string;
  lastname: string;
  firstname: string;
  id: string;
  name: string;
  picture: string;
  permissions: string[];
  mastertoken?: string;
  accountLevel?: string;
  admin?: string;
}

interface Property {
  id?: string;
  [key: string]: string;
}

interface AuthContextValues {
  token?: string;
  register: (email: string, password: string, confirm: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  requestMagicLink: (email: string) => Promise<any>;
  loginWithMagicLink: (magiccode: string) => Promise<any>;
  logout: () => void;
  forgot: (email: string) => Promise<any>;
  user?: User;
  saveUser: (newUser: Partial<User>) => void;
  setgoogleAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  changePassword: (
    id: string,
    old: string,
    password: string,
    password2: string
  ) => Promise<void>;
  impersonate: (id: string) => boolean;
  properties: Property[];
  saveProperties: (properties: Property[]) => Promise<void>;
  oldIdToNewMapping: (oldId: string) => Promise<string>;
}

interface AuthenticationProviderProps {
  children: ReactNode;
  googleClientId?: string;
  onError?: (message: string, error: any) => void;
}

const AuthenticationContext = createContext<AuthContextValues | null>(null);

export const useAuth = (): AuthContextValues => {
  const context = useContext(AuthenticationContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthenticationProvider");
  }
  return context;
};

const AuthenticationProvider: React.FC<AuthenticationProviderProps> = ({
  children,
  googleClientId,
  onError,
}) => {
  const [token, settoken] = useState<string | undefined>();
  const [googleAccessToken, setgoogleAccessToken] = useState<string | undefined>();
  const [user, setUser] = useState<User | undefined>();
  const { decodedToken } = useJwt(googleAccessToken || "");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const { tenant } = useTenant();
  const { deviceId } = useDeviceInfo();

  useEffect(() => {
    if (token) {
      localStorage.setItem(`cg.${tenant}.auth`, token);
    }
  }, [token, tenant]);

  useEffect(() => {
    if (!user?.id) return;
    fetchProperties();
  }, [user]);

  const validateToken = (token: string) => {
    const body = { token };
    fetch(
      combineUrlAndPath(REACT_APP_AUTH_API, "validateToken.php?debug=true"),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        if (data.errors) console.error("VALIDATE TOKEN ERRORS", data.errors);
        settoken(data.token);
        const userDetails: User = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: `${data.firstname} ${data.lastname}`,
          picture: data.avatar,
          permissions: data.permissions,
          mastertoken: data.mastertoken,
        };
        setUser(userDetails);
        if (window.location.hash.includes("auth")) window.location.hash = "#";
      })
      .catch((err) => onError?.("Auth: Unable to Validate Token", err))
      .finally(() => setLoading(false));
    settoken(token);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem(`cg.${tenant}.auth`);
    if (savedToken && savedToken !== "undefined") {
      validateToken(savedToken);
    } else {
      setLoading(false);
    }
  }, [tenant]);

  const reloadPermissions = async () => {
    const savedToken = localStorage.getItem(`cg.${tenant}.auth`);
    if (savedToken && savedToken !== "undefined") {
      validateToken(savedToken);
    }
  };

  useEventing("permissions", "reload", reloadPermissions);

  const getGoogleUser = useCallback(async () => {
    if (googleAccessToken && decodedToken) {
      const body = {
        email: decodedToken.email,
        firstname: decodedToken.firstname,
        lastname: decodedToken.lastname,
        googleid: decodedToken.sub,
        avatar: decodedToken.picture,
      };
      await fetch(
        combineUrlAndPath(REACT_APP_AUTH_API, `logingoogle.php`),
        {
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            deviceid: deviceId,
          },
          method: "POST",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          settoken(data.token);
          const userDetails: User = {
            email: data.email,
            lastname: data.lastname,
            firstname: data.firstname,
            id: data.id,
            name: `${data.firstname} ${data.lastname}`,
            picture: data.avatar,
            permissions: data.permissions,
            mastertoken: data.mastertoken,
          };
          setUser(userDetails);
          window.location.hash = "#";
        })
        .catch((err) => onError?.("Auth: Unable to complete Google Login", err));
    }
  }, [googleAccessToken, decodedToken, tenant, deviceId, onError]);

  useEffect(() => {
    if (googleAccessToken) getGoogleUser();
  }, [googleAccessToken, getGoogleUser]);

  const logout = () => {
    if (user?.mastertoken) {
      validateToken(user.mastertoken);
    } else {
      setgoogleAccessToken(undefined);
      setUser(undefined);
      settoken(undefined);
      window.location.hash = "#";
      localStorage.removeItem(`cg.${tenant}.auth`);
    }
  };

  const register = async (email: string, password: string, confirm: string) => {
    const body = { email, password, confirm };
    return fetch(
      combineUrlAndPath(REACT_APP_AUTH_API, `registration.php?debug=true`),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        settoken(data.token);
        const userDetails: User = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: `${data.firstname} ${data.lastname}`,
          picture: data.avatar,
          permissions: data.permissions,
        };
        setUser(userDetails);
        return data;
      })
      .catch((err) => onError?.("Auth: Unable to complete Registration", err));
  };

  const login = (email: string, password: string) => {
    const body = { email, password };
    return fetch(
      combineUrlAndPath(REACT_APP_AUTH_API, `login.php?debug=true`),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) return data;
        if (typeof data === "string") data = JSON.parse(data);
        settoken(data.token);
        const userDetails: User = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: `${data.firstname} ${data.lastname}`,
          picture: data.avatar,
          permissions: data.permissions,
        };
        setUser(userDetails);
        return data;
      })
      .catch((err) => {
        onError?.("Auth: Unable to complete Login", err);
        return err;
      });
  };

  const requestMagicLink = (email: string) => {
    const body = { code: email };
    return fetch(combineUrlAndPath(REACT_APP_AUTH_API, `magic.php`), {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        APP_ID: tenant,
        deviceid: deviceId,
      },
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        return data;
      })
      .catch((err) => onError?.("Auth: Unable to complete Magic Link Request", err));
  };

  const loginWithMagicLink = (magiccode: string) => {
    const body = { code: magiccode };
    return fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `loginwithmagiclink.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        settoken(data.token);
        const userDetails: User = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: `${data.firstname} ${data.lastname}`,
          picture: data.avatar,
          permissions: data.permissions,
        };
        setUser(userDetails);
        window.location.hash = "home";
      })
      .catch((err) => onError?.("Auth: Unable to complete Login", err));
  };

  const forgot = async (email: string) => {
    const body = { email };
    return fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `forgotpassword.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        return data;
      })
      .catch((err) => onError?.("Auth: Unable to complete Forgot Password", err));
  };

  const changePassword = (
    id: string,
    old: string,
    password: string,
    password2: string,
    hash?: string
  ) => {
    const body = { userid: id, oldpassword: old, password, password2, hash: hash };
    return fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `changepassword.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    ).catch((err) => onError?.("Auth: Unable to complete Change Password", err));
  };

  const impersonate = (id: string) => {
    fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `/impersonate.php?debug=true&id=${id}`
      ),
      {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token!,
          deviceid: deviceId,
        },
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        if (data.errors) console.error("IMPERSONATE TOKEN ERRORS", data.errors);
        settoken(data.token);
        const userDetails: User = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: `${data.firstname} ${data.lastname}`,
          picture: data.avatar,
          permissions: data.permissions,
          mastertoken: data.mastertoken,
        };
        setUser(userDetails);
        if (window.location.hash.includes("auth")) window.location.hash = "#";
      })
      .catch((err) => onError?.("Auth: Unable to Validate Token", err));
    return true;
  };

  const fetchProperties = async () => {
    if (!user) {
      setProperties([]);
      return;
    }
    await fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `/api.php/user/${user.id}/properties`
      ),
      {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token!,
        },
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        setProperties(data);
      })
      .catch((err) => onError?.("Auth: Unable to fetch properties", err));
  };

  const saveProperties = async (properties: Property[]) => {
    if (!user || !properties || !Array.isArray(properties)) return;

    const savePromises = properties.map((property) => {
      const url = property.id
        ? `${REACT_APP_AUTH_API}/api.php/property/${property.id}`
        : `${REACT_APP_AUTH_API}/api.php/property/`;

      const method = property.id ? "PUT" : "POST";

      return fetch(url, {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token!,
        },
        method,
        body: JSON.stringify(property),
      });
    });

    try {
      await Promise.all(savePromises);
      await fetchProperties();
    } catch (err) {
      onError?.("Auth: Unable to save properties", err);
    }
  };

  const saveUser = (newUser: Partial<User>) => {
    fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `api.php/user/${user!.id}`
      ),
      {
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token!,
        },
        method: "PUT",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") data = JSON.parse(data);
        settoken(data.token);
        setUser(data);
      })
      .catch((err) => onError?.("Auth: Unable to save user", err));
  };

  const oldIdToNewMapping = async (oldId: string) => {
    const resp = await fetch(
      combineUrlAndPath(
        REACT_APP_AUTH_API,
        `api.php/user/${oldId}/old`
      ),
      {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token!,
        },
      }
    );
    const data = await resp.json();
    return data[0].new_user_id;
  };

  const values = useMemo(
    () => ({
      token,
      register,
      login,
      requestMagicLink,
      loginWithMagicLink,
      logout,
      forgot,
      user,
      saveUser,
      setgoogleAccessToken,
      changePassword,
      impersonate,
      properties,
      saveProperties,
      oldIdToNewMapping,
    }),
    [
      token,
      register,
      login,
      requestMagicLink,
      loginWithMagicLink,
      logout,
      forgot,
      user,
      setgoogleAccessToken,
      changePassword,
      impersonate,
      properties,
      saveProperties,
      oldIdToNewMapping,
    ]
  );

  if (!REACT_APP_AUTH_API) {
    return (
      <div>
        <h1>Missing Configuration</h1>
        <p>
          Set the REACT_APP_AUTH_API environment variable to the URL of the
          CairnsGames Auth API
        </p>
      </div>
    );
  }

  if (loading) {
    return <h1>LOADING</h1>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthenticationContext.Provider value={values}>
        {children}
      </AuthenticationContext.Provider>
    </GoogleOAuthProvider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
