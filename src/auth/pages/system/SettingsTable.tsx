import React from "react";

function SettingsTable({ settings }: { settings: { name: string; value: string }[] }) {
  console.log("SettingsTable", settings);
  return (
    <div className="w-full overflow-x-auto">
      <table className="table-auto w-full bg-white rounded shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Value</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((setting, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{setting.name}</td>
              <td className="px-4 py-2">{setting.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SettingsTable;
