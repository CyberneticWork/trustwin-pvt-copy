// components/applyforloan/FinancialDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calculator } from "lucide-react";

export default function FinancialDetailsStep({ data, onChange, onNestedChange }) {
  // Track validation errors
  const [errors, setErrors] = useState({
    income: {
      businessIncome: '',
    },
    expenses: {
      businessExpenses: '',
      livingExpenses: '',
    },
  });

  // Calculate totals
  const totalIncome = (
    parseFloat(data.income?.businessIncome || 0) +
    parseFloat(data.income?.salaryIncome || 0) +
    parseFloat(data.income?.otherIncome || 0) +
    parseFloat(data.income?.interestIncome || 0)
  );

  const totalExpenses = (
    parseFloat(data.expenses?.businessExpenses || 0) +
    parseFloat(data.expenses?.utilityBills || 0) +
    parseFloat(data.expenses?.livingExpenses || 0) +
    parseFloat(data.expenses?.loanPayments || 0) +
    parseFloat(data.expenses?.existingLoanAmount || 0) +
    parseFloat(data.expenses?.otherExpenses || 0)
  );

  const netIncome = totalIncome - totalExpenses;
  
  // Calculate DSCR (Debt Service Coverage Ratio)
  // DSCR = Net Income / Total Debt Service
  const totalDebtService = parseFloat(data.expenses?.loanPayments || 0) + 
                          parseFloat(data.expenses?.existingLoanAmount || 0) +
                          parseFloat(data.rental || 0);
  
  const dscrRatio = totalDebtService > 0 ? (netIncome / totalDebtService).toFixed(2) : 0;
  
  const getDscrStatus = (ratio) => {
    const numRatio = parseFloat(ratio);
    if (numRatio >= 1.21) return { status: 'Good', color: 'text-green-600' };
    if (numRatio >= 0.75 && numRatio <= 1.20) return { status: 'Average', color: 'text-amber-600' };
    return { status: 'Bad', color: 'text-red-600' };
  };
  
  const dscrStatus = getDscrStatus(dscrRatio);

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.income?.businessIncome, data.expenses?.businessExpenses, data.expenses?.livingExpenses]);

  const validateForm = () => {
    const newErrors = {
      income: {
        businessIncome: '',
      },
      expenses: {
        businessExpenses: '',
        livingExpenses: '',
      },
    };

    // Business Income validation
    if (!data.income?.businessIncome) {
      newErrors.income.businessIncome = 'Business income is required';
    } else if (isNaN(data.income.businessIncome) || parseFloat(data.income.businessIncome) < 0) {
      newErrors.income.businessIncome = 'Please enter a valid amount';
    }

    // Business Expenses validation
    if (!data.expenses?.businessExpenses) {
      newErrors.expenses.businessExpenses = 'Business expenses are required';
    } else if (isNaN(data.expenses.businessExpenses) || parseFloat(data.expenses.businessExpenses) < 0) {
      newErrors.expenses.businessExpenses = 'Please enter a valid amount';
    }

    // Living Expenses validation
    if (!data.expenses?.livingExpenses) {
      newErrors.expenses.livingExpenses = 'Living expenses are required';
    } else if (isNaN(data.expenses.livingExpenses) || parseFloat(data.expenses.livingExpenses) < 0) {
      newErrors.expenses.livingExpenses = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return Object.values(newErrors).every(section => 
      Object.values(section).every(error => error === '')
    );
  };

  const handleNestedChange = (parent, field, value) => {
    // Only allow positive numbers or empty string
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      onNestedChange(parent, field, value);
      
      // Clear error when field is edited
      setErrors(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: ''
        }
      }));
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Income Section */}
        <div className="space-y-5">
          <h3 className="text-lg font-medium">Income</h3>
          
          <div className="space-y-3">
            <Label htmlFor="businessIncome" className="flex items-center">
              Business Income <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="businessIncome"
                type="number"
                value={data.income?.businessIncome || ''}
                onChange={(e) => handleNestedChange('income', 'businessIncome', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.income.businessIncome ? "border-red-500" : ""}`}
              />
            </div>
            {errors.income.businessIncome && (
              <p className="text-red-500 text-xs mt-1">{errors.income.businessIncome}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="salaryIncome">
              Salary Income
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="salaryIncome"
                type="number"
                value={data.income?.salaryIncome || ''}
                onChange={(e) => handleNestedChange('income', 'salaryIncome', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="otherIncome">
              Other Income
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="otherIncome"
                type="number"
                value={data.income?.otherIncome || ''}
                onChange={(e) => handleNestedChange('income', 'otherIncome', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="interestIncome">
              Interest Income (FDs and Other)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="interestIncome"
                type="number"
                value={data.income?.interestIncome || ''}
                onChange={(e) => handleNestedChange('income', 'interestIncome', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Income</span>
              <span className="font-medium">LKR {formatCurrency(totalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-5">
          <h3 className="text-lg font-medium">Expenses</h3>
          
          <div className="space-y-3">
            <Label htmlFor="businessExpenses" className="flex items-center">
              Business Expenses <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="businessExpenses"
                type="number"
                value={data.expenses?.businessExpenses || ''}
                onChange={(e) => handleNestedChange('expenses', 'businessExpenses', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.expenses.businessExpenses ? "border-red-500" : ""}`}
              />
            </div>
            {errors.expenses.businessExpenses && (
              <p className="text-red-500 text-xs mt-1">{errors.expenses.businessExpenses}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="utilityBills">
              Utility Bills
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="utilityBills"
                type="number"
                value={data.expenses?.utilityBills || ''}
                onChange={(e) => handleNestedChange('expenses', 'utilityBills', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="livingExpenses" className="flex items-center">
              Living Expenses <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="livingExpenses"
                type="number"
                value={data.expenses?.livingExpenses || ''}
                onChange={(e) => handleNestedChange('expenses', 'livingExpenses', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.expenses.livingExpenses ? "border-red-500" : ""}`}
              />
            </div>
            {errors.expenses.livingExpenses && (
              <p className="text-red-500 text-xs mt-1">{errors.expenses.livingExpenses}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="loanPayments">
              Existing Loan Payments
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="loanPayments"
                type="number"
                value={data.expenses?.loanPayments || ''}
                onChange={(e) => handleNestedChange('expenses', 'loanPayments', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="existingLoanAmount">
              Existing Loan Amount (Monthly)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="existingLoanAmount"
                type="number"
                value={data.expenses?.existingLoanAmount || ''}
                onChange={(e) => handleNestedChange('expenses', 'existingLoanAmount', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="otherExpenses">
              Other Expenses
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="otherExpenses"
                type="number"
                value={data.expenses?.otherExpenses || ''}
                onChange={(e) => handleNestedChange('expenses', 'otherExpenses', e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Expenses</span>
              <span className="font-medium">LKR {formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">NET INCOME</span>
            <span className={cn(
              "text-lg font-bold",
              netIncome >= 0 ? "text-green-600" : "text-red-600"
            )}>
              LKR {formatCurrency(netIncome)}
            </span>
          </div>
        </div>
        
        {/* DSCR Calculation */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-gray-500" />
            <h3 className="font-medium">Debt Service Coverage Ratio (DSCR)</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Net Income</span>
                <span className="font-medium">LKR {formatCurrency(netIncome)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Total Debt Service</span>
                <span className="font-medium">LKR {formatCurrency(totalDebtService)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">DSCR Ratio</span>
                <span className={`font-medium ${dscrStatus.color}`}>{dscrRatio}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Status:</span>
              <span className={`text-sm font-medium ${dscrStatus.color}`}>
                {dscrStatus.status}
              </span>
              <span className="text-xs text-gray-500">
                (Good: ≥1.21, Average: 0.75-1.20, Bad: &lt;0.75)
              </span>
            </div>
          </div>
        </div>
        
        {/* Warning if DSCR is too low */}
        {parseFloat(dscrRatio) < 0.75 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Warning: The DSCR ratio is below the recommended threshold. This may affect loan approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
