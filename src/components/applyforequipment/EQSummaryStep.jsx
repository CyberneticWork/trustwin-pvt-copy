// components/applyforequipment/EQSummaryStep.jsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EQSummaryStep({ data }) {
  // Calculate total income
  const totalIncome = parseFloat(data.income.businessIncome || 0) +
    parseFloat(data.income.salaryIncome || 0) +
    parseFloat(data.income.otherIncome || 0) +
    parseFloat(data.income.interestIncome || 0);

  // Calculate total expenses
  const totalExpenses = parseFloat(data.expenses.businessExpenses || 0) +
    parseFloat(data.expenses.utilityBills || 0) +
    parseFloat(data.expenses.livingExpenses || 0) +
    parseFloat(data.expenses.loanPayments || 0) +
    parseFloat(data.expenses.existingLoanAmount || 0) +
    parseFloat(data.expenses.otherExpenses || 0);

  // Calculate net income
  const netIncome = totalIncome - totalExpenses;

  // Calculate DSCR ratio (Debt Service Coverage Ratio)
  const monthlyRental = parseFloat(data.rental || 0);
  const dscrRatio = monthlyRental > 0 ? netIncome / monthlyRental : 0;

  // Format currency
  const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(number);
  };

  // Calculate loan summary values
  const devicePrice = parseFloat(data.equipment?.devicePrice) || 0;
  const downPayment = parseFloat(data.equipment?.downPayment) || 0;
  const loanAmount = parseFloat(data.loanAmount) || 0;
  const downPaymentPercentage = devicePrice > 0 ? (downPayment / devicePrice * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Smart Mobile Equipment Loan Summary</h2>
        <Badge variant={dscrRatio >= 1.21 ? "success" : dscrRatio >= 0.75 ? "warning" : "destructive"} className="text-xs px-2 py-1">
          DSCR: {dscrRatio.toFixed(2)}
        </Badge>
      </div>
      
      {/* Customer Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-medium">{data.customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID Number</p>
              <p className="font-medium">{data.idNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer ID</p>
              <p className="font-medium">{data.CusDisId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{data.dateOfBirth || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{data.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Residence Type</p>
              <p className="font-medium">{data.residenceType || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {data.address?.line1 ? `${data.address.line1}, ` : ''}
                {data.address?.line2 ? `${data.address.line2}, ` : ''}
                {data.address?.line3 ? `${data.address.line3}, ` : ''}
                {data.address?.city || ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Details Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            Device Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
            <div>
              <p className="text-sm text-gray-500">Make</p>
              <p className="font-medium">{data.equipment?.make || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium">{data.equipment?.model || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">{data.equipment?.capacity || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="font-medium">{data.equipment?.serialNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IMEI Number</p>
              <p className="font-medium">{data.equipment?.imeiNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year of Manufacture</p>
              <p className="font-medium">{data.equipment?.yom || 'N/A'}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-gray-500">Generation</p>
              <p className="font-medium">{data.equipment?.generation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Market Value</p>
              <p className="font-medium">{formatCurrency(data.equipment?.valuationAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 pb-3 mb-3 border-b">
            <div>
              <p className="text-sm text-gray-500">Loan Type</p>
              <p className="font-medium">{data.loanTypeName || 'Smart Mobile Loan'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Loan Period</p>
              <p className="font-medium">{data.period || 0} {data.periodType || 'Months'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contract Date</p>
              <p className="font-medium">{data.contractDate || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{data.dueDate || 'Not set'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-3">
            <div>
              <p className="text-sm text-gray-500">Device Price</p>
              <p className="font-medium">{formatCurrency(devicePrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Down Payment ({downPaymentPercentage}%)</p>
              <p className="font-medium">{formatCurrency(downPayment)}</p>
            </div>
            <div className="col-span-2">
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-blue-500 rounded-full" 
                  style={{width: `${devicePrice > 0 ? (loanAmount / devicePrice * 100) : 0}%`}}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-6 pt-3 border-t">
            <div>
              <p className="text-sm text-gray-500">Loan Amount</p>
              <p className="font-semibold text-lg">{formatCurrency(loanAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rental</p>
              <p className="font-semibold text-lg">{formatCurrency(data.rental)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IRR Rate</p>
              <p className="font-medium">{data.irrRate || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Repayment</p>
              <p className="font-medium">
                {formatCurrency((parseFloat(data.rental || 0) * parseFloat(data.period || 0)))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"/><path d="M12 18v2m0-16v2"/></svg>
            Financial Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income */}
            <div>
              <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Monthly Income</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Business Income</span>
                  <span>{formatCurrency(data.income.businessIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Salary Income</span>
                  <span>{formatCurrency(data.income.salaryIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Income</span>
                  <span>{formatCurrency(data.income.otherIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Interest Income</span>
                  <span>{formatCurrency(data.income.interestIncome)}</span>
                </div>
                <div className="flex justify-between pt-2 font-semibold border-t border-gray-200">
                  <span>Total Income</span>
                  <span>{formatCurrency(totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="font-semibold text-sm uppercase text-gray-600 mb-2">Monthly Expenses</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Business Expenses</span>
                  <span>{formatCurrency(data.expenses.businessExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Utility Bills</span>
                  <span>{formatCurrency(data.expenses.utilityBills)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Living Expenses</span>
                  <span>{formatCurrency(data.expenses.livingExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Existing Loan Payments</span>
                  <span>{formatCurrency(data.expenses.loanPayments)}</span>
                </div>
                <div className="flex justify-between pt-2 font-semibold border-t border-gray-200">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Net Monthly Income</span>
              <span className="font-semibold text-lg">{formatCurrency(netIncome)}</span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">Monthly Rental</span>
              <span className="font-semibold">{formatCurrency(data.rental)}</span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">DSCR Ratio</span>
              <div className="flex items-center">
                <span className={`font-semibold ${
                  dscrRatio >= 1.21 ? 'text-green-600' : 
                  dscrRatio >= 0.75 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {dscrRatio.toFixed(2)}
                </span>
                <Badge className="ml-2" variant={
                  dscrRatio >= 1.21 ? "outline" : 
                  dscrRatio >= 0.75 ? "outline" : "outline"
                }>
                  {dscrRatio >= 1.21 ? 'Good' : 
                   dscrRatio >= 0.75 ? 'Average' : 'Poor'}
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-2 ${
                    dscrRatio >= 1.21 ? 'bg-green-500' : 
                    dscrRatio >= 0.75 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(dscrRatio * 50, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0</span>
                <span>0.75</span>
                <span>1.21</span>
                <span>2.0+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Details */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Supplier Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <p className="text-sm text-gray-500">Supplier Name</p>
              <p className="font-medium">{data.supplier?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Registration No.</p>
              <p className="font-medium">{data.supplier?.brNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID Number</p>
              <p className="font-medium">{data.supplier?.idNumber || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Bank Details</p>
              <p className="font-medium">
                {data.supplier?.accountNumber ? `A/C: ${data.supplier.accountNumber}, ` : ''}
                {data.supplier?.bankName || 'N/A'}
                {data.supplier?.branchName ? ` (${data.supplier.branchName} Branch)` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guarantors */}
      {data.guarantors && data.guarantors.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 p-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Guarantors
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-200">
            {data.guarantors.map((guarantor, index) => (
              guarantor.name ? (
                <div key={index} className="py-4">
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="mr-2">Guarantor {index + 1}</Badge>
                    <h3 className="font-semibold">{guarantor.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
                    <div>
                      <p className="text-sm text-gray-500">ID Number</p>
                      <p className="font-medium">{guarantor.nic || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p className="font-medium">
                        {guarantor.relationship || 'N/A'}
                        {guarantor.relationshipOther ? ` - ${guarantor.relationshipOther}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Income</p>
                      <p className="font-medium">{formatCurrency(guarantor.income)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employment</p>
                      <p className="font-medium">{guarantor.employment || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bank Details</p>
                      <p className="font-medium">
                        {guarantor.accountNumber ? `${guarantor.accountNumber}, ` : ''}
                        {guarantor.bankName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Residence Type</p>
                      <p className="font-medium">{guarantor.residenceType || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : null
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
