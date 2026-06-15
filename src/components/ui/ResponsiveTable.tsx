import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export function ResponsiveTable({ columns, data, onRowClick }: ResponsiveTableProps) {
  return (
    <>
      <div className="table-shell hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="table-head border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((row, idx) => (
              <tr key={idx} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer transition hover:bg-cyan-50/60' : 'transition hover:bg-slate-50'}>
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {data.map((row, idx) => (
          <div key={idx} onClick={() => onRowClick?.(row)} className={`mobile-card ${onRowClick ? 'cursor-pointer active:bg-cyan-50/60' : ''}`}>
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="mb-3 last:mb-0">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{col.label}</div>
                  <div className="text-sm text-slate-900">{col.render ? col.render(row[col.key], row) : row[col.key]}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
