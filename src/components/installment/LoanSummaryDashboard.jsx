// components/installment/LoanSummaryDashboard.jsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LoanSummaryDashboard({
  facilityAmount = 0,
  paidAmount = 0,
  outstandingBalance = 0,
  arrears = 0,
  dueRentals = 0,
  paidRentals = 0,
  interest = 0,
  capital = 0,
  contractStatus = "Active",
  lastPaymentDate = "",
  nextDueDate = "",
  contractNumber = ""
}) {
  // Ensure all financial values are properly parsed as numbers
  const numFacilityAmount = parseFloat(facilityAmount) || 0;
  const numPaidAmount = parseFloat(paidAmount) || 0;
  const numOutstandingBalance = parseFloat(outstandingBalance) || 0;
  const numArrears = parseFloat(arrears) || 0;
  const numDueRentals = parseInt(dueRentals) || 0;
  const numPaidRentals = parseInt(paidRentals) || 0;
  const numInterest = parseFloat(interest) || 0;
  const numCapital = parseFloat(capital) || 0;
  
  // Calculate percentages for progress bars
  const paidPercentage = numFacilityAmount > 0 ? Math.round((numPaidAmount / numFacilityAmount) * 100) : 0;
  const outstandingPercentage = numFacilityAmount > 0 ? Math.round((numOutstandingBalance / numFacilityAmount) * 100) : 0;
  
  // Only calculate arrears percentage if arrears is positive
  const arrearsPercentage = (numArrears > 0 && numOutstandingBalance > 0) ? 
    Math.min(Math.round((numArrears / numOutstandingBalance) * 100), 100) : 0;
  
  // Determine contract status color based on arrears and status
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    
    // Override status color if there are arrears
    if (numArrears > 0 && statusLower === 'active') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    
    switch(statusLower) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'arrears':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'settled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'defaulted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Determine displayed status (show Arrears if active but has arrears)
  const displayStatus = numArrears > 0 && contractStatus.toLowerCase() === 'active' ? 
    'Arrears' : contractStatus;

  return (
    <Card className="overflow-hidden shadow-lg">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-white text-lg font-medium">Loan Facility Summary</h2>
          {contractNumber && (
            <p className="text-gray-300 text-sm mt-1">Contract: {contractNumber}</p>
          )}
        </div>
        <Badge className={`mt-2 md:mt-0 ${getStatusColor(displayStatus)}`}>
          {displayStatus}
        </Badge>
      </div>
      
      {/* Dashboard Content */}
      <div className="p-4">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Facility Amount</p>
            <p className="text-lg font-semibold">LKR {numFacilityAmount.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Paid Amount</p>
            <p className="text-lg font-semibold text-green-600">LKR {numPaidAmount.toLocaleString()}</p>
            <Progress value={paidPercentage} className="h-1 mt-2" />
            <p className="text-xs text-gray-500 mt-1">{paidPercentage}% of total</p>
          </div>
          
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Outstanding Balance</p>
            <p className="text-lg font-semibold text-amber-600">LKR {numOutstandingBalance.toLocaleString()}</p>
            <Progress value={outstandingPercentage} className="h-1 mt-2" />
            <p className="text-xs text-gray-500 mt-1">{outstandingPercentage}% remaining</p>
          </div>
          
          <div className={`bg-white p-3 rounded-md border ${numArrears > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'} shadow-sm`}>
            <p className="text-xs text-gray-500 uppercase">Arrears</p>
            <p className={`text-lg font-semibold ${numArrears > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              LKR {numArrears.toLocaleString()}
            </p>
            {numArrears > 0 && (
              <>
                <Progress value={arrearsPercentage} className="h-1 mt-2 bg-red-200" />
                <p className="text-xs text-red-500 mt-1">{arrearsPercentage}% of outstanding</p>
              </>
            )}
          </div>
        </div>
        
        {/* Rental Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Rentals</p>
              <p className="text-sm">
                <span className="font-medium text-blue-600">{numPaidRentals}</span>
                <span className="text-gray-400 mx-1">paid of</span>
                <span className="font-medium text-gray-600">{numDueRentals + numPaidRentals}</span>
              </p>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(numPaidRentals / Math.max(1, numDueRentals + numPaidRentals)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Capital</p>
                <p className="text-base font-medium">LKR {numCapital.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Interest</p>
                <p className="text-base font-medium">LKR {numInterest.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Last Payment</p>
                <p className="text-sm font-medium">{lastPaymentDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Next Due Date</p>
                <p className="text-sm font-medium">{nextDueDate || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Last Updated Timestamp */}
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}
