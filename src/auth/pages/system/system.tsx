import React from "react";
import { accessElf } from "../../../auth/utils/accessElf";
import { useTenant } from "../../../auth/hooks/useTenant";
import Navigation from "../../../application/Navigation";
import { useSettings } from "../../context/SettingsContext";
import ApplicationParamsTable from "./ApplicationParamsTable";
import SettingsTable from "./SettingsTable";

function SystemPage() {
    accessElf.track("SystemPage");
    const { params } = useTenant();
    const { settings, featureFlags } = useSettings();

  return (
    <div className="flex flex-col w-full bg-white">
      <Navigation />
      <div className="flex flex-col items-center px-4 mt-4">
        <h1 className="text-2xl font-bold">Application Params</h1>
        <ApplicationParamsTable params={params} />
        <h1 className="text-2xl font-bold mt-6">Settings</h1>
        <SettingsTable settings={settings || []} />
        
      <h1 className="text-2xl font-bold mt-6">Feature Flags</h1>
      <SettingsTable settings={featureFlags || []} />
      </div>
    </div>
  );
}

export default SystemPage;
