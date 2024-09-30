import { Checkbox } from "@mui/material";
import React, { useState } from "react";

const DynamicTable = ({
    data,
    columns,
    defaultRowSelected = [],
    onRowSelect,
    checkbox,
}) => {
    const [selectedRows, setSelectedRows] = useState(defaultRowSelected);

    const toggleRowSelection = (rowIndex) => {
        const updatedSelectedRows = selectedRows.includes(rowIndex)
            ? selectedRows.filter((index) => index !== rowIndex)
            : [...selectedRows, rowIndex];

        setSelectedRows(updatedSelectedRows);
        onRowSelect && onRowSelect(updatedSelectedRows);
    };

    const handleCheckAll = () => {
        const updatedSelectedRows =
            data.length !== selectedRows.length ? data.map((_, index) => index) : [];

        setSelectedRows(updatedSelectedRows);
        onRowSelect && onRowSelect(updatedSelectedRows);
    };

    return (
        <div className="relative overflow-x-auto shadow-lg rounded-md">
            <table className="w-full text-sm text-left">
                <thead className="text-[--active-text-color] border-b bg-white border-gray-300">
                    <tr>
                        {checkbox && (
                            <>
                                <th scope="col" className="p-4">
                                    <div className="flex justify-between ">
                                        <Checkbox
                                            id="checkbox-all"
                                            type="checkbox"
                                            onClick={handleCheckAll}
                                            checked={selectedRows.length === data.length}
                                            className="w-4 h-4 text-[--active-purple-active] bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                </th>
                            </>
                        )}

                        {columns.map((column, index) => (
                            <th key={index} scope="col" className="px-3 py-4 font-semibold text-[16px]">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`border-b bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover-bg-gray-600 
                             ${selectedRows.includes(rowIndex) ? "bg-[#ededed]" : ""} `}
                        >
                            {checkbox && (
                                <td className="w-4 p-4 bg-white">
                                    <div className="flex bg-white">
                                        <Checkbox
                                            id={`checkbox-table-${rowIndex}`}
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={selectedRows.includes(rowIndex)}
                                            onChange={() => toggleRowSelection(rowIndex)}
                                        />
                                    </div>
                                </td>
                            )}

                            {Object.entries(row).map(([key, cell], cellIndex) => {
                                const isObject = typeof cell === "object";
                                const bold = isObject && cell.bold ? "font-bold" : "font-medium";
                                return (
                                    <td
                                        key={cellIndex}
                                        className={`px-3 py-3 ${bold} text-[--active-text-color] bg-white whitespace-nowrap`}
                                    >
                                        {isObject ? cell.value : cell}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;
