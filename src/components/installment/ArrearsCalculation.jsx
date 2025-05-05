// components/installment/ArrearsCalculation.jsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ArrearsCalculation({
  frequency,
  startDate,
  dueAmount,
  lastPaidDate,
}) {
  const [arrearsAmount, setArrearsAmount] = useState(0);
  const [missedPayments, setMissedPayments] = useState(0);
  const [daysInArrears, setDaysInArrears] = useState(0);

  useEffect(() => {
    // Calculate arrears when props change
    calculateArrears();
  }, [frequency, startDate, dueAmount, lastPaidDate]);

  const calculateArrears = () => {
    if (!startDate || !lastPaidDate || !dueAmount) {
      setArrearsAmount(0);
      setMissedPayments(0);
      setDaysInArrears(0);
      return;
    }

    const today = new Date();
    const contractStart = new Date(startDate);
    const lastPaid = new Date(lastPaidDate);
    
    // Calculate days between last payment and today
    const daysDiff = Math.floor((today.getTime() - lastPaid.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) {
      // No arrears if payment is today or future dated
      setArrearsAmount(0);
      setMissedPayments(0);
      setDaysInArrears(0);
      return;
    }
    
    // Calculate missed payments based on frequency
    let missed = 0;
    let paymentPeriodInDays = 30; // Default to monthly
    
    switch (frequency) {
      case "daily":
        missed = daysDiff;
        paymentPeriodInDays = 1;
        break;
      case "weekly":
        missed = Math.floor(daysDiff / 7);
        paymentPeriodInDays = 7;
        break;
      case "monthly":
        missed = Math.floor(daysDiff / 30); // Assuming 30 days per month as specified
        paymentPeriodInDays = 30;
        break;
    }
    
    // Calculate arrears amount
    // Base amount = due amount × missed payments
    const baseAmount = parseFloat(dueAmount) * missed;
    
    // Calculate arrears interest - 3% monthly rate
    const monthlyRate = 0.03;
    const dailyRate = monthlyRate / 30; // Convert monthly rate to daily
    const arrearsInterest = baseAmount * dailyRate * daysDiff;
    
    const totalArrears = baseAmount + arrearsInterest;
    
    setArrearsAmount(parseFloat(totalArrears.toFixed(2)));
    setMissedPayments(missed);
    setDaysInArrears(daysDiff);
  };

  return (
    <Card className="p-4 shadow-md">
      <h3 className="text-lg font-medium mb-3">Arrears Calculation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Days in Arrears</Label>
          <p className={`font-medium ${daysInArrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {daysInArrears} days
          </p>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Missed Payments</Label>
          <p className={`font-medium ${missedPayments > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {missedPayments} {frequency === "monthly" ? "months" : frequency === "weekly" ? "weeks" : "days"}
          </p>
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
          <p>* Last payment was {daysInArrears} days ago on {new Date(lastPaidDate).toLocaleDateString()}</p>
        </div>
      )}
    </Card>
  );
}
