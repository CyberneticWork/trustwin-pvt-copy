// components/applyforloan/BankDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function BankDetailsStep({ data, onChange, onNestedChange }) {
  // Track validation errors
  const [errors, setErrors] = useState({
    accountType: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    bankAccountPeriod: '',
    bankTurnover: {
      jan: '',
      feb: '',
      mar: ''
    }
  });

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.accountType, data.accountNumber, data.bankName, data.branchName]);

  const validateForm = () => {
    const newErrors = {
      accountType: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      bankAccountPeriod: '',
      bankTurnover: {
        jan: '',
        feb: '',
        mar: ''
      }
    };

    // Account Type validation
    if (!data.accountType) {
      newErrors.accountType = 'Account type is required';
    }

    // Account Number validation
    if (!data.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{5,20}$/.test(data.accountNumber)) {
      newErrors.accountNumber = 'Account number should be 5-20 digits';
    }

    // Bank Name validation
    if (!data.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    // Branch Name validation
    if (!data.branchName) {
      newErrors.branchName = 'Branch name is required';
    }

    // Bank Account Period validation (optional but if provided, should be a positive number)
    if (data.bankAccountPeriod && (isNaN(data.bankAccountPeriod) || Number(data.bankAccountPeriod) <= 0)) {
      newErrors.bankAccountPeriod = 'Period must be a positive number';
    }

    // Bank Turnover validations (optional but must be valid numbers if provided)
    if (data.bankTurnover?.jan && (isNaN(data.bankTurnover.jan) || Number(data.bankTurnover.jan) < 0)) {
      newErrors.bankTurnover.jan = 'Must be a valid number';
    }
    
    if (data.bankTurnover?.feb && (isNaN(data.bankTurnover.feb) || Number(data.bankTurnover.feb) < 0)) {
      newErrors.bankTurnover.feb = 'Must be a valid number';
    }
    
    if (data.bankTurnover?.mar && (isNaN(data.bankTurnover.mar) || Number(data.bankTurnover.mar) < 0)) {
      newErrors.bankTurnover.mar = 'Must be a valid number';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return Object.values(newErrors).every(value => 
      typeof value === 'object' 
        ? Object.values(value).every(v => v === '')
        : value === ''
    );
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    
    // Clear error when field is edited
    if (field.includes('.')) {
      // Handle nested fields like bankTurnover.jan
      const [parent, child] = field.split('.');
      setErrors(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: ''
        }
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  const handleNestedChange = (parent, field, value) => {
    onNestedChange(parent, field, value);
    
    // Clear error when nested field is edited
    setErrors(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: ''
      }
    }));
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bank Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Type */}
        <div className="space-y-2">
          <Label htmlFor="accountType" className="flex items-center">
            Account Type <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.accountType || ''}
            onValueChange={(value) => handleChange('accountType', value)}
          >
            <SelectTrigger id="accountType" className={errors.accountType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Savings">Savings</SelectItem>
              <SelectItem value="Current">Current</SelectItem>
              <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
              <SelectItem value="Joint Account">Joint Account</SelectItem>
            </SelectContent>
          </Select>
          {errors.accountType && <p className="text-red-500 text-xs mt-1">{errors.accountType}</p>}
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <Label htmlFor="accountNumber" className="flex items-center">
            Account Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="accountNumber"
            value={data.accountNumber || ''}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            placeholder="Enter account number"
            className={errors.accountNumber ? "border-red-500" : ""}
            maxLength={20}
          />
          {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
        </div>

        {/* Bank Name */}
        <div className="space-y-2">
          <Label htmlFor="bankName" className="flex items-center">
            Bank <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.bankName || ''}
            onValueChange={(value) => handleChange('bankName', value)}
          >
            <SelectTrigger id="bankName" className={errors.bankName ? "border-red-500" : ""}>
              <SelectValue placeholder="Select bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bank of Ceylon">Bank of Ceylon</SelectItem>
              <SelectItem value="People's Bank">People's Bank</SelectItem>
              <SelectItem value="Commercial Bank">Commercial Bank</SelectItem>
              <SelectItem value="Hatton National Bank">Hatton National Bank</SelectItem>
              <SelectItem value="Sampath Bank">Sampath Bank</SelectItem>
              <SelectItem value="Nations Trust Bank">Nations Trust Bank</SelectItem>
              <SelectItem value="DFCC Bank">DFCC Bank</SelectItem>
              <SelectItem value="NDB Bank">NDB Bank</SelectItem>
              <SelectItem value="Pan Asia Bank">Pan Asia Bank</SelectItem>
              <SelectItem value="Seylan Bank">Seylan Bank</SelectItem>
              <SelectItem value="Union Bank">Union Bank</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
        </div>

        {/* Branch Name */}
        <div className="space-y-2">
          <Label htmlFor="branchName" className="flex items-center">
            Branch <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="branchName"
            value={data.branchName || ''}
            onChange={(e) => handleChange('branchName', e.target.value)}
            placeholder="Enter branch name"
            className={errors.branchName ? "border-red-500" : ""}
          />
          {errors.branchName && <p className="text-red-500 text-xs mt-1">{errors.branchName}</p>}
        </div>

        {/* Bank Account Period */}
        <div className="space-y-2">
          <Label htmlFor="bankAccountPeriod">
            Period of Bank Account (months)
          </Label>
          <Input
            id="bankAccountPeriod"
            type="number"
            value={data.bankAccountPeriod || ''}
            onChange={(e) => handleChange('bankAccountPeriod', e.target.value)}
            placeholder="e.g. 36"
            className={errors.bankAccountPeriod ? "border-red-500" : ""}
            min="1"
          />
          {errors.bankAccountPeriod && <p className="text-red-500 text-xs mt-1">{errors.bankAccountPeriod}</p>}
        </div>
      </div>

      {/* Bank Turnover Section */}
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-4">Monthly Bank Turnover (Last 3 months)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* January */}
          <div className="space-y-2">
            <Label htmlFor="turnoverJan">
              January
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="turnoverJan"
                type="number"
                value={data.bankTurnover?.jan || ''}
                onChange={(e) => handleNestedChange('bankTurnover', 'jan', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.bankTurnover?.jan ? "border-red-500" : ""}`}
              />
            </div>
            {errors.bankTurnover?.jan && <p className="text-red-500 text-xs mt-1">{errors.bankTurnover.jan}</p>}
          </div>

          {/* February */}
          <div className="space-y-2">
            <Label htmlFor="turnoverFeb">
              February
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="turnoverFeb"
                type="number"
                value={data.bankTurnover?.feb || ''}
                onChange={(e) => handleNestedChange('bankTurnover', 'feb', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.bankTurnover?.feb ? "border-red-500" : ""}`}
              />
            </div>
            {errors.bankTurnover?.feb && <p className="text-red-500 text-xs mt-1">{errors.bankTurnover.feb}</p>}
          </div>

          {/* March */}
          <div className="space-y-2">
            <Label htmlFor="turnoverMar">
              March
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="turnoverMar"
                type="number"
                value={data.bankTurnover?.mar || ''}
                onChange={(e) => handleNestedChange('bankTurnover', 'mar', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.bankTurnover?.mar ? "border-red-500" : ""}`}
              />
            </div>
            {errors.bankTurnover?.mar && <p className="text-red-500 text-xs mt-1">{errors.bankTurnover.mar}</p>}
          </div>
        </div>

        {/* Average Monthly Turnover */}
        {(data.bankTurnover?.jan || data.bankTurnover?.feb || data.bankTurnover?.mar) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Monthly Turnover</span>
              <span className="font-medium">
                LKR {formatCurrency((
                  (parseFloat(data.bankTurnover?.jan || 0) + 
                   parseFloat(data.bankTurnover?.feb || 0) + 
                   parseFloat(data.bankTurnover?.mar || 0)) / 3
                ).toFixed(2))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
