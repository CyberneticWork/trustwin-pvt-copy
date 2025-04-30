// components/applyforloan/LoanDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addWeeks, addMonths } from "date-fns";
import { CalendarIcon, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoanDetailsStep({ data, onChange }) {
  const [errors, setErrors] = useState({
    loanAmount: '',
    period: '',
    periodType: '',
    contractDate: '',
    rental: ''
  });
  
  // For date picker
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Get current year and set a reasonable range
  const currentYear = new Date().getFullYear();
  const [calendarYear, setCalendarYear] = useState(currentYear); // Default to current year

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.loanAmount, data.period, data.periodType, data.contractDate, data.rental]);

  // Calculate due date based on contract date, period, and periodType
  useEffect(() => {
    if (data.contractDate && data.period && data.periodType) {
      const contractDate = new Date(data.contractDate);
      let dueDate;
      
      if (data.periodType === "Weeks") {
        dueDate = addWeeks(contractDate, parseInt(data.period));
      } else if (data.periodType === "Months") {
        dueDate = addMonths(contractDate, parseInt(data.period));
      }
      
      if (dueDate) {
        onChange('dueDate', dueDate.toISOString());
      }
    }
  }, [data.contractDate, data.period, data.periodType]);

  const validateForm = () => {
    const newErrors = {
      loanAmount: '',
      period: '',
      periodType: '',
      contractDate: '',
      rental: ''
    };

    // Loan Amount validation
    if (!data.loanAmount) {
      newErrors.loanAmount = 'Loan amount is required';
    } else if (isNaN(data.loanAmount) || Number(data.loanAmount) <= 0) {
      newErrors.loanAmount = 'Enter a valid amount';
    }

    // Period validation
    if (!data.period) {
      newErrors.period = 'Loan period is required';
    } else if (isNaN(data.period) || Number(data.period) <= 0 || !Number.isInteger(Number(data.period))) {
      newErrors.period = 'Enter a valid whole number';
    }

    // Period Type validation
    if (!data.periodType) {
      newErrors.periodType = 'Period type is required';
    }

    // Contract Date validation
    if (!data.contractDate) {
      newErrors.contractDate = 'Contract date is required';
    }
    
    // Rental validation
    if (!data.rental) {
      newErrors.rental = 'Rental amount is required';
    } else if (isNaN(data.rental) || Number(data.rental) <= 0) {
      newErrors.rental = 'Enter a valid amount';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return Object.values(newErrors).every(error => error === '');
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    
    // Clear error when field is edited
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Custom year navigation for calendar
  const handleYearChange = (increment) => {
    setCalendarYear(prev => prev + increment);
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate total repayment amount
  const calculateTotalRepayment = () => {
    if (!data.rental || !data.period || isNaN(data.rental) || isNaN(data.period)) {
      return 0;
    }
    return parseFloat(data.rental) * parseFloat(data.period);
  };
  
  // Calculate interest amount (difference between total repayment and loan amount)
  const calculateInterest = () => {
    if (!data.loanAmount || isNaN(data.loanAmount)) {
      return 0;
    }
    return calculateTotalRepayment() - parseFloat(data.loanAmount);
  };
  
  // Calculate approximate interest rate
  const calculateApproxRate = () => {
    if (!data.loanAmount || !data.period || isNaN(data.loanAmount) || isNaN(data.period) || parseFloat(data.loanAmount) === 0) {
      return 0;
    }
    
    const interest = calculateInterest();
    const principal = parseFloat(data.loanAmount);
    let periodInYears;
    
    if (data.periodType === "Weeks") {
      periodInYears = parseFloat(data.period) / 52;
    } else if (data.periodType === "Months") {
      periodInYears = parseFloat(data.period) / 12;
    } else {
      return 0;
    }
    
    // Simple interest rate calculation: (Interest / Principal) / Time * 100
    return ((interest / principal) / periodInYears) * 100;
  };

  // Year navigation buttons
  const YearNavigation = () => {
    return (
      <div className="flex justify-between items-center px-2 py-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleYearChange(-1)}
          className="text-xs"
        >
          -1 Year
        </Button>
        <div className="flex items-center justify-center px-2 font-medium">
          {calendarYear}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleYearChange(1)}
          className="text-xs"
          disabled={calendarYear >= currentYear + 1}
        >
          +1 Year
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Loan Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Type */}
        <div className="space-y-2">
          <Label htmlFor="loanType" className="flex items-center">
            Loan Type
          </Label>
          <Select
            value={data.loanType || ''}
            onValueChange={(value) => {
              handleChange('loanType', value);
              // Set corresponding loan type name
              if (value === "MBL") {
                handleChange('loanTypeName', "Micro Business Loan");
              } else if (value === "AUTO") {
                handleChange('loanTypeName', "Auto Loan");
              }
            }}
            disabled={!!data.loanType} // Disable if it's already set
          >
            <SelectTrigger id="loanType" className="bg-gray-50">
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MBL">MBL - Micro Business Loan</SelectItem>
              <SelectItem value="AUTO">AUTO - Auto Loan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loan Amount */}
        <div className="space-y-2">
          <Label htmlFor="loanAmount" className="flex items-center">
            Loan Amount <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
            <Input
              id="loanAmount"
              type="number"
              value={data.loanAmount || ''}
              onChange={(e) => handleChange('loanAmount', e.target.value)}
              placeholder="0.00"
              className={`pl-12 ${errors.loanAmount ? "border-red-500" : ""}`}
            />
          </div>
          {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>}
        </div>
      </div>

      {/* Period and Period Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="period" className="flex items-center">
            Loan Period <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="period"
            type="number"
            value={data.period || ''}
            onChange={(e) => handleChange('period', e.target.value)}
            placeholder="Enter number of periods"
            className={errors.period ? "border-red-500" : ""}
          />
          {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period}</p>}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            Period Type <span className="text-red-500 ml-1">*</span>
          </Label>
          <RadioGroup
            value={data.periodType || ''}
            onValueChange={(value) => handleChange('periodType', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Weeks" id="periodWeeks" />
              <Label htmlFor="periodWeeks">Weeks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Months" id="periodMonths" />
              <Label htmlFor="periodMonths">Months</Label>
            </div>
          </RadioGroup>
          {errors.periodType && <p className="text-red-500 text-xs mt-1">{errors.periodType}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Date */}
        <div className="space-y-2">
          <Label htmlFor="contractDate" className="flex items-center">
            Contract Date <span className="text-red-500 ml-1">*</span>
          </Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.contractDate && "text-muted-foreground",
                  errors.contractDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.contractDate ? format(new Date(data.contractDate), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.contractDate ? new Date(data.contractDate) : undefined}
                onSelect={(date) => {
                  handleChange('contractDate', date ? date.toISOString() : '');
                  setIsCalendarOpen(false);
                }}
                defaultMonth={new Date(calendarYear, new Date().getMonth(), 1)}
              />
              <YearNavigation />
            </PopoverContent>
          </Popover>
          {errors.contractDate && <p className="text-red-500 text-xs mt-1">{errors.contractDate}</p>}
        </div>

        {/* Due Date (calculated) */}
        <div className="space-y-2">
          <Label htmlFor="dueDate">
            Due Date
          </Label>
          <Input
            id="dueDate"
            value={data.dueDate ? format(new Date(data.dueDate), "PPP") : ''}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Automatically calculated based on contract date and period
          </p>
        </div>
      </div>

      {/* Rental Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="rental" className="flex items-center">
            Rental Amount <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
            <Input
              id="rental"
              type="number"
              value={data.rental || ''}
              onChange={(e) => handleChange('rental', e.target.value)}
              placeholder="0.00"
              className={`pl-12 ${errors.rental ? "border-red-500" : ""}`}
            />
          </div>
          {errors.rental && <p className="text-red-500 text-xs mt-1">{errors.rental}</p>}
        </div>
      </div>

      {/* Loan Calculations */}
      {data.loanAmount && data.period && data.rental && (
        <div className="border rounded-lg overflow-hidden mt-4">
          <div className="bg-gray-50 p-3 border-b flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-gray-500" />
            <h3 className="font-medium">Loan Calculator</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Loan Amount</span>
                <span className="font-medium">LKR {formatCurrency(data.loanAmount)}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 block mb-1">
                  {data.periodType === "Weeks" ? "Weekly" : "Monthly"} Rental
                </span>
                <span className="font-medium">LKR {formatCurrency(data.rental)}</span>
              </div>

              <div>
                <span className="text-sm text-gray-500 block mb-1">Total Repayment</span>
                <span className="font-medium">LKR {formatCurrency(calculateTotalRepayment())}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 block mb-1">Total Interest</span>
                <span className="font-medium">LKR {formatCurrency(calculateInterest())}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approx. Annual Interest Rate:</span>
                <span className="text-lg font-bold text-blue-600">
                  {calculateApproxRate().toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
