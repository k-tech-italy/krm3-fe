import React from "react";

interface ReportTableProps {
  title: string;
  days: string[]; // e.g. ["2025-07-01", ...]
  data: Record<string, Record<string, (number | null)[]>>; // user/resource -> key -> values
  resource: Record<string, string>; // key -> human label
}

const ReportTable: React.FC<ReportTableProps> = ({ title, days, data, resource: keymap }) => {
  const users = Object.keys(data).filter((u) => u.trim() !== "");
  const keys = Object.keys(keymap);

  return (
    <div>
      <table className="min-w-full border border-gray-300 text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 border border-gray-200 bg-gray-100"></th>
            {days.map((d) => (
              <th key={d} className="px-2 py-1 border border-gray-200 bg-gray-100">
                {d.slice(-2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <React.Fragment key={user}>
              <tr>
                <td
                  className="px-2 py-1 border border-gray-200 font-bold bg-gray-50 text-left"
                  colSpan={days.length + 1}
                >
                  {user}
                </td>
              </tr>
              {keys.map((key) => (
                <tr key={key}>
                  <td className="px-2 py-1 border border-gray-200 text-right bg-gray-50">
                    {keymap[key]}
                  </td>
                  {days.map((_, i) => (
                    <td key={i} className="px-2 py-1 border border-gray-200 text-center">
                      {data[user] && data[user][key] && data[user][key][i] != null
                        ? data[user][key][i]
                        : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
