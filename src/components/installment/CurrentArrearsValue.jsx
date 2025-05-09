import React from 'react';

/**
 * Props:
 *   value: number | string (required) - The arrears value to display
 *   label: string (optional) - The label to show (defaults to 'Current Arrears')
 *   className: string (optional) - Extra CSS classes for the wrapper
 */
export default function CurrentArrearsValue({ value, label = 'Current Arrears', className = '' }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="font-medium text-red-600 bg-red-100 px-1 rounded">
        LKR {Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
