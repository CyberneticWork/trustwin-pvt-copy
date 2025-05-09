// components/installment/ArrearsCalculation.jsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculateArrears } from "./arrearsCalculationUtil";

export default function ArrearsCalculation({
  frequency,
  startDate,
  dueAmount,
  currentDate, // Optional: For testing with specific dates
  interestRates = {
    monthlyRate: 3, // %
    gracePeriodDays: 3 // per month
  },
  currentArrears
}) {
  const [arrearsAmount, setArrearsAmount] = useState(0);
  const [missedPeriods, setMissedPeriods] = useState(0);
  const [totalArrearsDays, setTotalArrearsDays] = useState(0);
  const [interestAmount, setInterestAmount] = useState(0);
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const {
      arrearsAmount,
      missedPeriods,
      totalArrearsDays,
      interestAmount,
      breakdown
    } = calculateArrears({ frequency, startDate, dueAmount, currentDate, interestRates });
    setArrearsAmount(arrearsAmount);
    setMissedPeriods(missedPeriods);
    setTotalArrearsDays(totalArrearsDays);
    setInterestAmount(interestAmount);
    setBreakdown(breakdown);
  }, [frequency, startDate, dueAmount, currentDate, interestRates]);


  return (
    <Card className="p-4 shadow-md">
      <h3 className="text-lg font-medium mb-3">Arrears Calculation</h3>
      {typeof currentArrears === 'number' && currentArrears > 0 && (
        <div className="mb-3">
          <Label className="text-xs text-gray-500">Current Arrears</Label>
          <p className="font-bold text-red-700 bg-red-100 px-3 py-1 rounded inline-block">LKR {currentArrears.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div>
            <Label className="text-xs text-gray-500">Missed Periods</Label>
            <p className="font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded inline-block">{missedPeriods}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Days in Arrears</Label>
            <p className="font-bold text-red-700 bg-red-100 px-3 py-1 rounded inline-block">{totalArrearsDays}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Interest Amount</Label>
            <p className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded inline-block">LKR {interestAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Total Arrears Amount</Label>
          <p className={`font-medium ${arrearsAmount > 0 ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-green-600'}`}>
            LKR {arrearsAmount.toLocaleString()}
          </p>
        </div>
      </div>
      
      {arrearsAmount > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          <p>* Arrears calculation based on 3% monthly rate</p>
          <p>* Days in arrears: {totalArrearsDays}</p>
        </div>
      )}
    </Card>
  );
}
