import React from "react";

function ApplicationParamsTable({ params }: { params: { name: string; value: string }[] }) {
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
          {params.map((param, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{param.name}</td>
              <td className="px-4 py-2">{param.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationParamsTable;
