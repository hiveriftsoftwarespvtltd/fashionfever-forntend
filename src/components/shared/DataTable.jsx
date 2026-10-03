import React from 'react';
import { Loader2, Inbox } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Universal High-Contrast Clean Data Table Component
 * Designed for crisp visibility in both Light & Dark modes
 */
const DataTable = ({ columns, data = [], loading, onRowClick }) => {
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div className={`h-80 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
        isDarkMode ? 'bg-zinc-900/80 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        </div>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
          Loading Directory Records...
        </p>
        <span className={`text-[11px] font-medium mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Synchronizing live datasets
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
      isDarkMode 
        ? 'bg-zinc-900/90 border-zinc-800 shadow-2xl shadow-black/30' 
        : 'bg-white border-zinc-200 shadow-sm'
    }`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left min-w-[760px] border-collapse">
          <thead>
            <tr className={`border-b transition-colors ${
              isDarkMode 
                ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300' 
                : 'bg-zinc-50/90 border-zinc-200 text-zinc-600'
            }`}>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider whitespace-nowrap select-none"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors ${
            isDarkMode ? 'divide-zinc-800/80' : 'divide-zinc-100'
          }`}>
            {data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 group cursor-pointer ${
                    isDarkMode 
                      ? 'hover:bg-zinc-800/40 text-zinc-200' 
                      : 'hover:bg-zinc-50/90 text-zinc-800'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 align-middle">
                      <div className={`text-xs font-semibold leading-relaxed transition-colors ${
                        isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                      }`}>
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                      isDarkMode ? 'bg-zinc-800/80 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      <Inbox size={26} />
                    </div>
                    <p className={`font-bold text-sm uppercase tracking-wide mb-1 ${
                      isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      No Records Available
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      There are no entries currently available in this directory.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
