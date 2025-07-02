import React from 'react';

interface TableProps {
  columns: string[];
  data: any[];
  onRowClick?: (row: any) => void;
  selectedRowId?: string;
  rowIdKey?: string; // default 'id'
}

const Table: React.FC<TableProps> = ({ columns, data, onRowClick, selectedRowId, rowIdKey = 'id' }) => {
  return (
    <div className="overflow-x-auto border-solid  rounded-md">
      <table className="table-fixed w-full border-solid  border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col} className="border-solid px-4 py-2 text-left font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isSelected = row[rowIdKey] === selectedRowId;
            return (
              <tr
                key={row[rowIdKey]}
                onClick={() => onRowClick?.(row)}
                className={`cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col} className="border-solid  px-4 py-2">
                    {row[col]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
