import React, { createContext, useEffect, useMemo, useState, ReactNode } from "react";
import { REACT_APP_TENANT_API } from "../../env";
import { combineUrlAndPath } from "../utils/combineUrlAndPath";
import { accessElf } from "../utils/accessElf";

interface TenantProviderProps {
  children: ReactNode;
  applicationId: string;
  config?: Array<{ name: string; value: string }>;
  params?: Array<{ name: string; value: string }>;
  onError?: (message: string, error: string | string[]) => void;
}

interface Application {
  id: number;
  applicationid: string;
  name: string;
  description: string;
}

interface TenantContextValues {
  tenant: string;
  application: Application | null;
  config?: Array<{ name: string; value: string }>;
  params: Array<{ name: string; value: string }>;
}

const TenantContext = createContext<TenantContextValues | null>(null);

const TenantProvider: React.FC<TenantProviderProps> = (props) => {
  const { children, onError } = props;

  const [tenant] = useState<string>(props.applicationId);
  const configValue = props.config;
  const [params, setParams] = useState<Array<{ name: string; value: string }>>(props.params || []);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<string>("starting");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!tenant) {
      return;
    }
    setLoading("loading");
    fetch(combineUrlAndPath(REACT_APP_TENANT_API, "api.php/tenant"), {
      headers: { "Content-Type": "application/json", APP_ID: tenant },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length === 0) {
          setError("Tenant: No Tenant Details found, ");
          return;
        }
        if (Array.isArray(data)) {
          setApplication(data[0] as Application);
        } else {
          setApplication(data as Application);
        }
      })
      .catch((err) => {
        if (onError) {
          onError("Tenant: Unable to fetch Tenant details", err);
        }
      });
    fetch(REACT_APP_TENANT_API + "getsettings.php", {
      headers: { "Content-Type": "application/json", APP_ID: tenant },
    })
      .then((res) => res.json())
      .then((data) => {
        setParams(data);
        const accessElfApikey = data.find((s) => s.name === "accessElfApiKey");
        if (accessElfApikey && accessElfApikey.value !== "") {
          accessElf.setApiKey(accessElfApikey.value);
        } else {
          console.warn("No ApiKey found for AccessElf");
        }
      })
      .catch((err) => {
        if (onError) {
          onError("Tenant: Unable to fetch Tenant Params", err);
        }
      })
      .finally(() => {
        setLoading("loaded");
      });
  }, [tenant]);

  const values = useMemo<TenantContextValues>(
    () => ({ tenant, application, config: configValue, params }),
    [tenant, application, configValue, params]
  );

  if (!props.applicationId || props.applicationId === "unknown") {
    return (
      <div>
        <h1>Unknown Tenant</h1>
        <p>Set the application prop to the tenant name in Cairnsgames</p>
      </div>
    );
  }
  if (!REACT_APP_TENANT_API) {
    return (
      <div>
        <h1>Missing Configuration</h1>
        <p>
          Set the REACT_APP_TENANT_API environment variable to the URL of the
          tenant API
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
        <p>Check the following items</p>
        <ul>
          <li>Set the application prop to the tenant name in Cairnsgames</li>
          <li>
            Set the REACT_APP_TENANT_API environment variable to the URL of the
            tenant API
          </li>
        </ul>
      </div>
    );
  }

  if (loading !== "loaded") {
    return <h1>Loading</h1>;
  }

  return (
    <TenantContext.Provider value={values}>{children}</TenantContext.Provider>
  );
};

export { TenantContext, TenantProvider };
