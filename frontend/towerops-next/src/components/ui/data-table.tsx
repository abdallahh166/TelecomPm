import { ReactNode } from 'react';

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-800">
          {headers.map((h) => (
            <th className="px-3 py-2 text-left text-xs uppercase text-slate-400" key={h}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr className="border-b border-slate-900" key={i}>
            {row.map((cell, idx) => (
              <td className="px-3 py-3 text-sm" key={idx}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
