"use client";
import { useState, useEffect } from 'react';
import { AutoLoanCalculator } from "@/components/Calculations/AutoLoanCalculator";
import { AmortizationCharts } from "@/components/Calculations/AmortizationCharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AutoLoanCalculatorPage() {
  // Vehicle details
  const [vehiclePrice, setVehiclePrice] = useState(2500000);
  const [downPayment, setDownPayment] = useState(500000);
  const [tradeInValue, setTradeInValue] = useState(0);
  
  // Loan details
  const [interestRate, setInterestRate] = useState(14.5);
  const [loanTerm, setLoanTerm] = useState(60); // 60 months = 5 years
  
  // Additional costs
  const [salesTax, setSalesTax] = useState(6);
  const [otherFees, setOtherFees] = useState(25000);
  
  // Display options
  const [showAmortizationSchedule, setShowAmortizationSchedule] = useState(false);
  const [scheduleView, setScheduleView] = useState('monthly'); // 'monthly', 'yearly', 'quarterly'
  
  // Results state
  const [results, setResults] = useState(null);
  
  // Calculate loan details when parameters change
  useEffect(() => {
    const calculationResults = AutoLoanCalculator(
      vehiclePrice,
      interestRate,
      loanTerm,
      downPayment,
      salesTax,
      otherFees,
      tradeInValue
    );
    
    setResults(calculationResults);
  }, [
    vehiclePrice,
    interestRate, 
    loanTerm,
    downPayment,
    salesTax,
    otherFees,
    tradeInValue
  ]);

  // Format currency in LKR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value}%`;
  };
  
  // Filter amortization schedule based on view preference
  const getFilteredSchedule = () => {
    if (!results || !results.amortizationSchedule) return [];
    
    if (scheduleView === 'monthly') {
      return results.amortizationSchedule;
    } else if (scheduleView === 'yearly') {
      return results.amortizationSchedule.filter((_, index) => 
        (index + 1) % 12 === 0 || index === results.amortizationSchedule.length - 1
      );
    } else if (scheduleView === 'quarterly') {
      return results.amortizationSchedule.filter((_, index) => 
        (index + 1) % 3 === 0 || index === results.amortizationSchedule.length - 1
      );
    }
    
    return results.amortizationSchedule;
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6 min-h-screen overflow-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold tracking-tight">Auto Loan Calculator</h1>
      <p className="text-muted-foreground">
        Calculate your auto loan payments and view the complete amortization schedule
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Input form */}
        <div className="space-y-6">
          {/* Vehicle Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                <Input
                  id="vehiclePrice"
                  type="number"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Down payment is {((downPayment / vehiclePrice) * 100).toFixed(1)}% of the vehicle price
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tradeInValue">Trade-in Value</Label>
                <Input
                  id="tradeInValue"
                  type="number"
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Loan Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="loanTerm">Loan Term</Label>
                <Select 
                  value={loanTerm.toString()} 
                  onValueChange={(value) => setLoanTerm(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 months (2 years)</SelectItem>
                    <SelectItem value="36">36 months (3 years)</SelectItem>
                    <SelectItem value="48">48 months (4 years)</SelectItem>
                    <SelectItem value="60">60 months (5 years)</SelectItem>
                    <SelectItem value="72">72 months (6 years)</SelectItem>
                    <SelectItem value="84">84 months (7 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Costs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salesTax">Sales Tax (%)</Label>
                <Input
                  id="salesTax"
                  type="number"
                  value={salesTax}
                  onChange={(e) => setSalesTax(Number(e.target.value))}
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherFees">Other Fees</Label>
                <Input
                  id="otherFees"
                  type="number"
                  value={otherFees}
                  onChange={(e) => setOtherFees(Number(e.target.value))}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Documentation, registration, and other dealer fees
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Results */}
        <div className="space-y-6">
          {/* Loan Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {results ? (
                <>
                  {/* Monthly Payment Display */}
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-emerald-800">Monthly Payment</p>
                      <p className="text-3xl font-bold text-emerald-700">{formatCurrency(results.monthlyPayment)}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Key Values Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle Price</p>
                      <p className="font-medium">{formatCurrency(results.vehiclePrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Down Payment</p>
                      <p className="font-medium">{formatCurrency(results.downPayment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trade-in Value</p>
                      <p className="font-medium">{formatCurrency(results.tradeInValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Tax</p>
                      <p className="font-medium">{formatCurrency(results.salesTaxAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Other Fees</p>
                      <p className="font-medium">{formatCurrency(results.otherFees)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{formatPercentage(results.annualInterestRate)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Financing Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Financed</p>
                      <p className="text-xl font-medium">{formatCurrency(results.amountFinanced)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Term</p>
                      <p className="text-xl font-medium">{results.loanTermMonths} months ({(results.loanTermMonths / 12).toFixed(1)} years)</p>
                    </div>
                  </div>
                  
                  {/* Cost Summary Card */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-blue-800">Total Principal</p>
                          <p className="font-semibold">{formatCurrency(results.amountFinanced)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-blue-800">Total Interest</p>
                          <p className="font-semibold">{formatCurrency(results.totalInterest)}</p>
                        </div>
                        <Separator className="my-1 bg-blue-200" />
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-blue-900">TOTAL COST</p>
                          <p className="text-xl font-bold text-blue-900">{formatCurrency(results.totalLoanCost)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p>Calculating results...</p>
              )}
            </CardContent>
          </Card>
          
          {/* Charts Section - Use the imported AmortizationCharts component */}
          {results && (
            <AmortizationCharts amortizationData={results} />
          )}
          
          {/* Amortization Schedule Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showAmortization" 
              checked={showAmortizationSchedule}
              onCheckedChange={setShowAmortizationSchedule}
            />
            <Label htmlFor="showAmortization" className="cursor-pointer">
              Show Amortization Schedule
            </Label>
          </div>
          
          {/* Amortization Schedule Table - Detailed payment breakdown */}
          {showAmortizationSchedule && results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Amortization Schedule</span>
                  <Select 
                    value={scheduleView} 
                    onValueChange={setScheduleView}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly View</SelectItem>
                      <SelectItem value="quarterly">Quarterly View</SelectItem>
                      <SelectItem value="yearly">Yearly View</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of each payment over the life of your loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Remaining Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredSchedule().map((payment) => (
                        <TableRow key={payment.paymentNumber}>
                          <TableCell>{payment.paymentNumber}</TableCell>
                          <TableCell>{formatCurrency(payment.paymentAmount)}</TableCell>
                          <TableCell>{formatCurrency(payment.principalPayment)}</TableCell>
                          <TableCell>{formatCurrency(payment.interestPayment)}</TableCell>
                          <TableCell>{formatCurrency(payment.remainingBalance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Call to Action Button */}
          <Button className="w-full">Get Pre-Approved For This Auto Loan</Button>
        </div>
      </div>
    </div>
  );
}