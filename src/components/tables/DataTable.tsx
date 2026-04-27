'use client';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  getId?: (row: T) => string;
  idKey?: keyof T | string; // ID için key (getId yerine kullanılabilir)
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  getId,
  idKey = 'id',
}: DataTableProps<T>) {
  const getRowId = (row: T): string => {
    if (getId) {
      return getId(row);
    }
    if (typeof idKey === 'string') {
      return String(idKey.split('.').reduce((obj, key) => obj?.[key], row) ?? '');
    }
    return String(row[idKey] ?? '');
  };

  return (
    <div className="bg-light border-dark-200 overflow-x-auto rounded-lg border shadow">
      <table className="divide-dark-200 min-w-full divide-y">
        <thead className="bg-light">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="text-brand px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-brand px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                İşlemler
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-light divide-dark-200 divide-y">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-dark px-6 py-4 text-center opacity-60"
              >
                Veri bulunamadı
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={getRowId(row)} className="hover:bg-light-300 transition-colors">
                {columns.map((column) => {
                  const value =
                    typeof column.key === 'string'
                      ? column.key.split('.').reduce((obj, key) => obj?.[key], row)
                      : row[column.key];

                  return (
                    <td
                      key={String(column.key)}
                      className="text-dark px-6 py-4 text-sm whitespace-nowrap"
                    >
                      {column.render ? column.render(value, row) : String(value ?? '')}
                    </td>
                  );
                })}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="text-dark hover:text-brand cursor-pointer"
                        >
                          Düzenle
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="text-dark hover:text-brand cursor-pointer"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
