function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800 text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-zinc-900">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-14">
                <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-zinc-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-medium text-slate-400 dark:text-zinc-600">No records found</p>
                  <p className="text-xs text-slate-300 dark:text-zinc-700">Records will appear here once added.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-100 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900'
                    : 'hover:bg-slate-50/60 dark:hover:bg-zinc-900/60'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
