// Example usage for CurrentArrearsValue
import React from 'react';
import CurrentArrearsValue from '@/components/installment/CurrentArrearsValue';

export default function CurrentArrearsValueUsage({ value }) {
  return (
    <div className="my-2">
      {/* After ArrearsCalculation */}
      <CurrentArrearsValue value={value} />
    </div>
  );
}
