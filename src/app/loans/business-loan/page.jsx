"use client";
import { useState, useEffect } from 'react';
import { BusinessLoanCalculator } from "@/components/Calculations/BusinessLoanCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SimpleBusinessLoanPage() {
  // State for loan type
  const [loanType, setLoanType] = useState('daily');

  // Common state
  const [principal, setPrincipal] = useState(50000);
  
  // Initial payments state - replacing service charge
  const [showInitialPayments, setShowInitialPayments] = useState(false);
  const [docCharges, setDocCharges] = useState(0);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [insuranceCharges, setInsuranceCharges] = useState(0);
  const [serviceChargeOption, setServiceChargeOption] = useState('capitalize');

  // Daily loan specific state
  const [dailyRate, setDailyRate] = useState(5);
  const [dailyTermDays, setDailyTermDays] = useState(20);

  // Monthly loan specific state
  const [monthlyRate, setMonthlyRate] = useState(5);
  const [months, setMonths] = useState(3);
  const [interestFrequency, setInterestFrequency] = useState('yearly');

  // Weekly loan specific state
  const [weeks, setWeeks] = useState(12);

  // Results state
  const [results, setResults] = useState(null);
  const [clientReceiving, setClientReceiving] = useState(principal);

  // Calculate loan details when parameters change
  useEffect(() => {
    let calculationResults;
    
    // Calculate total initial charges
    const totalInitialCharges = showInitialPayments ? 
      docCharges + serviceCharges + insuranceCharges : 0;
    
    // Map the service charge option to the calculator's initialPaymentOption
    let initialPaymentOption;
    switch (serviceChargeOption) {
      case 'capitalize':
        initialPaymentOption = 'capitalizeCharges';
        break;
      case 'separate':
        initialPaymentOption = 'clientPay';
        break;
      case 'withdraw':
        initialPaymentOption = 'withdrawFromCapital';
        break;
      default:
        initialPaymentOption = 'clientPay';
    }

    // Calculate client receiving amount
    let receivingAmount;
    if (!showInitialPayments) {
      receivingAmount = principal;
    } else {
      switch (serviceChargeOption) {
        case 'capitalize':
          receivingAmount = principal;
          break;
        case 'separate':
          receivingAmount = principal;
          break;
        case 'withdraw':
          receivingAmount = principal - totalInitialCharges;
          break;
        default:
          receivingAmount = principal;
      }
    }
    setClientReceiving(receivingAmount);

    if (loanType === 'daily') {
      calculationResults = BusinessLoanCalculator(
        principal,
        dailyRate,
        dailyTermDays,
        'daily',
        'monthly',
        0, // serviceCharge is now 0, as we're using initialPayment
        totalInitialCharges, // new initialPayment parameter
        initialPaymentOption // new initialPaymentOption parameter
      );
    } else if (loanType === 'weekly') {
      const equivalentMonths = weeks / 4;
      const monthlyResults = BusinessLoanCalculator(
        principal,
        monthlyRate,
        equivalentMonths,
        'monthly',
        interestFrequency,
        0, // serviceCharge is now 0, as we're using initialPayment
        totalInitialCharges, // new initialPayment parameter
        initialPaymentOption // new initialPaymentOption parameter
      );

      calculationResults = {
        ...monthlyResults,
        payment: monthlyResults.payment / 4,
        totalPaymentPeriods: weeks,
        daysPerPeriod: 7
      };
    } else {
      calculationResults = BusinessLoanCalculator(
        principal,
        monthlyRate,
        months,
        'monthly',
        interestFrequency,
        0, // serviceCharge is now 0, as we're using initialPayment
        totalInitialCharges, // new initialPayment parameter
        initialPaymentOption // new initialPaymentOption parameter
      );
    }
    setResults(calculationResults);
  }, [
    loanType, 
    principal, 
    dailyRate, 
    dailyTermDays, 
    monthlyRate, 
    months, 
    interestFrequency, 
    weeks, 
    docCharges,
    serviceCharges,
    insuranceCharges,
    serviceChargeOption,
    showInitialPayments
  ]);

  // Format currency in LKR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get initial payments display
  const getInitialPaymentsDisplay = () => {
    if (!showInitialPayments) return { text: "None", color: "text-gray-500" };
    
    const totalCharges = docCharges + serviceCharges + insuranceCharges;
    let prefix = '';
    let textColor = '';

    switch (serviceChargeOption) {
      case 'capitalize':
        prefix = '+';
        textColor = 'text-green-600';
        break;
      case 'separate':
        textColor = 'text-gray-600';
        break;
      case 'withdraw':
        prefix = '-';
        textColor = 'text-red-600';
        break;
      default:
        textColor = 'text-black';
    }

    return {
      text: `${prefix}${formatCurrency(totalCharges)}`,
      color: textColor
    };
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6 min-h-screen overflow-auto">
      <h1 className="text-3xl font-bold tracking-tight">Business Loan Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Input form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loan Type Selection */}
              <div className="space-y-2">
                <Label>Loan Type</Label>
                <Tabs 
                  value={loanType} 
                  onValueChange={setLoanType}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Common inputs for all loan types */}
              <div className="space-y-2">
                <Label htmlFor="principal">Loan Amount</Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                />
              </div>
              
              {/* Loan-specific inputs */}
              {loanType === 'daily' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Monthly Interest Rate (%)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                      step="0.1"
                      min="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyTermDays">Loan Term (days)</Label>
                    <Input
                      id="dailyTermDays"
                      type="number"
                      value={dailyTermDays}
                      onChange={(e) => setDailyTermDays(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                </>
              )}
              
              {loanType === 'weekly' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyRate">Interest Rate (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="weeklyRate"
                        type="number"
                        value={monthlyRate}
                        onChange={(e) => setMonthlyRate(Number(e.target.value))}
                        step="0.1"
                        min="1"
                        className="flex-1"
                      />
                      <Select 
                        value={interestFrequency}
                        onValueChange={setInterestFrequency}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">Weekly payments are calculated as monthly payment ÷ 4</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeks">Loan Term (weeks)</Label>
                    <Input
                      id="weeks"
                      type="number"
                      value={weeks}
                      onChange={(e) => setWeeks(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                </>
              )}
              
              {loanType === 'monthly' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRate">Interest Rate (%)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="monthlyRate"
                        type="number"
                        value={monthlyRate}
                        onChange={(e) => setMonthlyRate(Number(e.target.value))}
                        step="0.1"
                        min="1"
                        className="flex-1"
                      />
                      <Select 
                        value={interestFrequency}
                        onValueChange={setInterestFrequency}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="months">Loan Term (months)</Label>
                    <Input
                      id="months"
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                </>
              )}
              
              {/* Initial Payments Section - moved to bottom of form */}
              <div className="pt-4 mt-4 border-t">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Initial Payments Options</h3>
                  <p className="text-sm text-muted-foreground">Configure initial charges and how they're applied to the loan</p>
                </div>
                
                <RadioGroup 
                  value={showInitialPayments ? "yes" : "no"}
                  onValueChange={(value) => setShowInitialPayments(value === "yes")}
                  className="mb-4"
                >
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="showInitialPaymentsYes" />
                      <Label htmlFor="showInitialPaymentsYes">Include Initial Payments</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="showInitialPaymentsNo" />
                      <Label htmlFor="showInitialPaymentsNo">No Initial Payments</Label>
                    </div>
                  </div>
                </RadioGroup>
                
                {showInitialPayments && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-md border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="docCharges">Doc Charges</Label>
                        <Input
                          id="docCharges"
                          type="number"
                          value={docCharges}
                          onChange={(e) => setDocCharges(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceCharges">Service Charges</Label>
                        <Input
                          id="serviceCharges"
                          type="number"
                          value={serviceCharges}
                          onChange={(e) => setServiceCharges(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insuranceCharges">Insurance Charges</Label>
                        <Input
                          id="insuranceCharges"
                          type="number"
                          value={insuranceCharges}
                          onChange={(e) => setInsuranceCharges(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm font-medium">
                        Total Initial Charges: {formatCurrency(docCharges + serviceCharges + insuranceCharges)}
                      </p>
                      
                      <Select 
                        value={serviceChargeOption} 
                        onValueChange={setServiceChargeOption}
                      >
                        <SelectTrigger className="w-full sm:w-[280px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="capitalize">Capitalize Initial Charges</SelectItem>
                          <SelectItem value="separate">Client Pays Separately</SelectItem>
                          <SelectItem value="withdraw">Withdraw from Capital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {results ? (
                <>
                  {/* Client Receiving Amount */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-emerald-800">Client Will Receive</p>
                      <p className="text-2xl font-bold text-emerald-700">{formatCurrency(clientReceiving)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-50">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">
                        {loanType === 'daily' ? 'Daily' : loanType === 'weekly' ? 'Weekly' : 'Monthly'} Payment
                      </p>
                      <p className="text-2xl font-bold">{formatCurrency(results.payment)}</p>
                      <p className="text-sm text-muted-foreground">Total of {results.totalPaymentPeriods} payments</p>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Principal</p>
                      <p className="font-xl">{formatCurrency(principal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Initial Payments</p>
                      <p className={cn("font-medium", getInitialPaymentsDisplay().color)}>
                        {getInitialPaymentsDisplay().text}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-large ">
                        {loanType === 'daily' ? dailyRate : monthlyRate}% 
                        {loanType === 'daily' ? ' Monthly' : 
                          interestFrequency === 'monthly' ? ' Monthly' : ' Yearly'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="font-medium">{formatCurrency(results.totalInterest)}</p>
                    </div>
                  </div>
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-blue-800">TOTAL PAYABLE</p>
                          <p className="text-xl font-bold">{formatCurrency(results.totalPayable)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Effective Rate</p>
                          <p className="text-lg font-bold">{(results.totalInterest / principal * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Loan Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Loan Type:</span>
                        <span className="ml-2">
                          {loanType === 'daily' ? 'Daily Loan' : loanType === 'weekly' ? 'Weekly Loan' : 'Monthly Loan'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Loan Term:</span>
                        <span className="ml-2">
                          {loanType === 'daily' ? `${dailyTermDays} days` : 
                           loanType === 'weekly' ? `${weeks} weeks` : 
                           `${months} months`}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Initial Amount:</span>
                        <span className="ml-2">{formatCurrency(principal)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Principal:</span>
                        <span className="ml-2">{formatCurrency(results.totalPrincipal)}</span>
                      </div>
                      
                      {showInitialPayments && (
                        <div>
                          <span className="text-muted-foreground">Initial Payments Option:</span>
                          <span className="ml-2">
                            {serviceChargeOption === 'capitalize' ? 'Capitalize Initial Charges' : 
                             serviceChargeOption === 'separate' ? 'Client Pays Separately' : 
                             'Withdraw from Capital'}
                          </span>
                        </div>
                      )}
                      
                      {showInitialPayments && (
                        <div>
                          <span className="text-muted-foreground">Initial Payment Amount:</span>
                          <span className="ml-2">{formatCurrency(results.initialPayment)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button className="w-full">Apply for This Loan</Button>
                </>
              ) : (
                <p>Calculating results...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}