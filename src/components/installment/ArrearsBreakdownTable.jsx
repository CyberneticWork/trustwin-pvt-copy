import React from "react";

/**
 * ArrearsBreakdownTable
 * @param {Object} props
 * @param {Object} props.data - { lastPaymentDate, totalDays, months, graceDays, arrearsDays }
 */
export default function ArrearsBreakdownTable({ data }) {
  if (!data) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded mb-2 text-center">
        No arrears breakdown data available for this contract.
      </div>
    );
  }
  const { lastPaymentDate, totalDays, months, graceDays, arrearsDays } = data;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[400px] border border-gray-300 bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Last Payment Date</th>
            <th className="px-4 py-2 border">Total Days</th>
            <th className="px-4 py-2 border">Months</th>
            <th className="px-4 py-2 border">Grace Days</th>
            <th className="px-4 py-2 border">Arrears Days</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border text-center">{lastPaymentDate ? new Date(lastPaymentDate).toLocaleDateString() : '-'}</td>
            <td className="px-4 py-2 border text-center">{totalDays}</td>
            <td className="px-4 py-2 border text-center">{months}</td>
            <td className="px-4 py-2 border text-center">{graceDays}</td>
            <td className="px-4 py-2 border text-center font-semibold text-red-600">{arrearsDays}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

