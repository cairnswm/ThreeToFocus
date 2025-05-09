import React, {
  useState,
  createContext,
  useEffect,
  useMemo,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useTenant } from "../hooks/useTenant";
import { REACT_APP_SETTINGS_API, REACT_APP_FLAGS_API } from "../../env";
import { combineUrlAndPath } from "../utils/combineUrlAndPath";

interface KeyValue {
  name: string
  value: string | number
}

interface SettingsContextType {
  settings: KeyValue[]
  featureFlags?: KeyValue[]
}

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<KeyValue[]>([])
  const [featureFlags, setFeatureFlags] = useState<KeyValue[]>([])

  const { tenant } = useTenant();
  const { user } = useAuth();

  const fetchFeatureFlags = async () => {
    console.log("USER", user);
    const body = {
      userid: user?.id,
      accountlevel: user?.accountlevel,
      admin: user?.admin,
    };
    fetch(`${REACT_APP_FLAGS_API}/getfeatureflags.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", APP_ID: tenant },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result && typeof data.result === "object") {
            setFeatureFlags(
            Object.entries(data.result).map(([key, value]) => ({
              name: key,
              value: value as string | number,
            }))
            );
        } else {
          setFeatureFlags([]);
        }
      })
      .catch(() => {
        setFeatureFlags([]);
      });
  };

  const fetchSettings = async () => {
    fetch(combineUrlAndPath(REACT_APP_SETTINGS_API, `mysettings/${user.id}`), {
      method: "GET",
      headers: { "Content-Type": "application/json", APP_ID: tenant },
    })
      .then((res) => res.json())
      .then((res) => {
        if (Array.isArray(res)) {
          setSettings(
            res.map((item) => ({ name: item.keyname, value: item.val }))
          );
        } else {
          setSettings([{ name: res.keyname, value: res.val }]);
        }
      })
      .catch((err) => {
        console.error("Error fetching settings:", err);
        setSettings([]);
      });
  };

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
      fetchFeatureFlags();
    }
  }, [user, tenant]);

  const hasFlag = useCallback((flag: string, value: string | number) => {
    const flagValue = featureFlags.find((f) => f.name === flag)?.value;
    return flagValue === value;
  },[featureFlags]);

  const getFlagValue = useCallback((flag: string) => {
    const flagValue = featureFlags.find((f) => f.name === flag)?.value;
    return flagValue;
  },[featureFlags]);

  const values = useMemo(
    () => ({
      settings,
      featureFlags,
      hasFlag,
      getFlagValue,
    }),
    [settings, featureFlags, hasFlag, getFlagValue]
  );

  if (!REACT_APP_SETTINGS_API) {
    return (
      <div>
        <h1>Missing Configuration</h1>
        <p>
          Set the REACT_APP_SETTINGS_API environment variable to the URL of the
          Settings API
        </p>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={values}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
