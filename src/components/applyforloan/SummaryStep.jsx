// components/applyforloan/SummaryStep.jsx
"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Check, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import PDFGenerator from "@/components/PDFGenerator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function SummaryStep({ data }) {
  const contentRef = useRef(null);

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate financial totals
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
  
  // Calculate total repayment amount
  const totalRepayment = parseFloat(data.rental || 0) * parseFloat(data.period || 0);
  
  // Calculate DSCR (Debt Service Coverage Ratio)
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get total capitalized charges
  const getTotalCapitalizedCharges = () => {
    if (!data.capitalizedCharges || !data.payments) return 0;
    
    return Object.entries(data.capitalizedCharges).reduce((total, [key, isCapitalized]) => {
      return total + (isCapitalized ? parseFloat(data.payments[key] || 0) : 0);
    }, 0);
  };

  const totalCapitalizedCharges = getTotalCapitalizedCharges();
  const finalLoanAmount = parseFloat(data.loanAmount || 0) + totalCapitalizedCharges;

  // Enhanced download function
  const handleDownload = async () => {
    try {
      const element = contentRef.current;
      
      // Add a class to enable PDF-specific styling during capture
      element.classList.add('generating-pdf');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove the class after capture
      element.classList.remove('generating-pdf');
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`Loan_Application_${data.customerId || 'Summary'}.pdf`);

      // Visual feedback without using toast
      const downloadButton = document.getElementById('download-button');
      if (downloadButton) {
        const originalText = downloadButton.innerText;
        downloadButton.innerText = "Downloaded!";
        downloadButton.classList.add("bg-green-100", "text-green-700", "border-green-300");
        
        setTimeout(() => {
          downloadButton.innerText = originalText;
          downloadButton.classList.remove("bg-green-100", "text-green-700", "border-green-300");
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Visual feedback for error without using toast
      const downloadButton = document.getElementById('download-button');
      if (downloadButton) {
        const originalText = downloadButton.innerText;
        downloadButton.innerText = "Download Failed";
        downloadButton.classList.add("bg-red-100", "text-red-700", "border-red-300");
        
        setTimeout(() => {
          downloadButton.innerText = originalText;
          downloadButton.classList.remove("bg-red-100", "text-red-700", "border-red-300");
        }, 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Loan Application Summary</h2>
        <div className="flex space-x-2">
          {/* Direct Download Button */}
          {/*<Button
            id="download-button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <Download className="mr-1 h-4 w-4" />
            Download PDF
          </Button> */}
          
          {/* Keep existing PDFGenerator if needed */}
          <PDFGenerator 
            contentRef={contentRef} 
            filename={`Loan_Application_${data.customerId || 'Summary'}`}
          />
        </div>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 text-sm">
          Please review all the information below carefully before proceeding to the submission step.
        </AlertDescription>
      </Alert>
      
      {/* Content to be included in PDF */}
      <div ref={contentRef} className="space-y-6">
        {/* PDF Document Header - Only visible in PDF */}
        <div className="hidden pdf-only">
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold">Loan Application Summary</h1>
            <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Personal Information */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-lg mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer ID</p>
                <p className="font-medium">{data.customerId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium">{data.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID Number</p>
                <p className="font-medium">{data.idNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{data.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(data.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Residence Type</p>
                <p className="font-medium">{data.residenceType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {data.address?.line1}
                  {data.address?.line2 ? `, ${data.address.line2}` : ''}
                  {data.address?.line3 ? `, ${data.address.line3}` : ''}
                  {data.address?.city ? `, ${data.address.city}` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-lg mb-3">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Loan Type</p>
                <p className="font-medium">{data.loanTypeName} ({data.loanType})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loan Amount</p>
                <p className="font-medium">LKR {formatCurrency(data.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium">{data.period} {data.periodType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rental Amount</p>
                <p className="font-medium">LKR {formatCurrency(data.rental)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contract Date</p>
                <p className="font-medium">{formatDate(data.contractDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(data.dueDate)}</p>
              </div>
              
              {/* Show capitalized charges if present */}
              {totalCapitalizedCharges > 0 && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Capitalized Charges</p>
                    <p className="font-medium">LKR {formatCurrency(totalCapitalizedCharges)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Final Loan Amount</p>
                    <p className="font-medium text-blue-600">LKR {formatCurrency(finalLoanAmount)}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Repayment Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  {data.periodType === "Weeks" ? "Weekly" : "Monthly"} Rental
                </span>
                <span className="font-bold">LKR {formatCurrency(data.rental)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Repayment</span>
                <span className="font-bold">LKR {formatCurrency(totalRepayment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-lg mb-3">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium">{data.accountType || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{data.accountNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank</p>
                <p className="font-medium">{data.bankName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p className="font-medium">{data.branchName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Period</p>
                <p className="font-medium">{data.bankAccountPeriod || "N/A"} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Business & Financial Information */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-lg mb-3">Business & Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Nature of Business</p>
                <p className="font-medium">{data.natureOfBusiness || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium">{data.businessType || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">{data.businessName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="font-medium">{data.businessRegistrationNo || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Period</p>
                <p className="font-medium">{data.businessPeriod || "N/A"} months</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Business Address</p>
                <p className="font-medium">{data.businessAddress || "N/A"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4 border-t pt-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Income</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="pb-1 text-gray-500">Business Income</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.income?.businessIncome || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Salary Income</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.income?.salaryIncome || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Other Income</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.income?.otherIncome || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Interest Income</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.income?.interestIncome || 0)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="pt-1 font-medium">Total Income</td>
                      <td className="pt-1 text-right font-medium">LKR {formatCurrency(totalIncome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Expenses</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="pb-1 text-gray-500">Business Expenses</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.expenses?.businessExpenses || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Utility Bills</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.expenses?.utilityBills || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Living Expenses</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.expenses?.livingExpenses || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Loan Payments</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.expenses?.loanPayments || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Existing Loan Amount</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.expenses?.existingLoanAmount || 0)}</td>
                    </tr>
                    <tr>
                      <td className="pb-1 text-gray-500">Other Expenses</td>
                      <td className="pb-1 text-right font-medium">LKR {formatCurrency(data.expenses?.otherExpenses || 0)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="pt-1 font-medium">Total Expenses</td>
                      <td className="pt-1 text-right font-medium">LKR {formatCurrency(totalExpenses)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Net Income */}
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">NET INCOME</span>
                  <span className={cn(
                    "font-bold",
                    netIncome >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    LKR {formatCurrency(netIncome)}
                  </span>
                </div>
              </div>
              
              {/* DSCR Ratio */}
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">DSCR RATIO</span>
                  <span className={cn("font-bold", dscrStatus.color)}>
                    {dscrRatio} ({dscrStatus.status})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Guarantor Details */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-lg mb-3">Guarantor Information</h3>
            
            {data.guarantors && data.guarantors.length > 0 ? (
              <div className="space-y-6">
                {data.guarantors.map((guarantor, index) => (
                  guarantor && guarantor.name ? (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-medium mb-2">Guarantor {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{guarantor.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ID Number</p>
                          <p className="font-medium">{guarantor.nic}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="font-medium">{guarantor.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{formatDate(guarantor.dateOfBirth)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Relationship</p>
                          <p className="font-medium">
                            {guarantor.relationship === 'Other' 
                              ? `Other: ${guarantor.relationshipOther}` 
                              : guarantor.relationship}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mobile</p>
                          <p className="font-medium">{guarantor.mobile}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{guarantor.address}</p>
                        </div>
                        {guarantor.employment && (
                          <div>
                            <p className="text-sm text-gray-500">Employment</p>
                            <p className="font-medium">{guarantor.employment}</p>
                          </div>
                        )}
                        {guarantor.income && (
                          <div>
                            <p className="text-sm text-gray-500">Monthly Income</p>
                            <p className="font-medium">LKR {formatCurrency(guarantor.income)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No guarantor information provided.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Document Verification */}
        {data.documents && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium text-lg mb-3">Document Verification</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                    data.documents.idDocument ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">ID Document</span>
                </div>
                
                <div className="flex items-center">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                    data.documents.utilityBill ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Utility Bill</span>
                </div>
                
                <div className="flex items-center">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                    data.investigationImages?.residence?.[0] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Residence Images</span>
                </div>
                
                <div className="flex items-center">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                    data.investigationImages?.selfie ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Selfie Photo</span>
                </div>
                
                {data.loanType !== "AUTO" && (
                  <div className="flex items-center">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                      data.investigationImages?.business?.[0] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Business Images</span>
                  </div>
                )}
                
                {data.loanType === "AUTO" && (
                  <>
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                        data.vehicle?.documents?.valuation ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                      )}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm">Valuation Document</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center mr-2",
                        data.vehicle?.documents?.crBook ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                      )}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm">CR Book</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Auto Loan Specific Details */}
        {data.loanType === "AUTO" && data.vehicle && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium text-lg mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{data.vehicle.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Make</p>
                  <p className="font-medium">{data.vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{data.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="font-medium">{data.vehicle.vehicleNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chassis Number</p>
                  <p className="font-medium">{data.vehicle.chassisNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Engine Number</p>
                  <p className="font-medium">{data.vehicle.engineNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Engine Capacity</p>
                  <p className="font-medium">{data.vehicle.engineCapacity} cc</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meter Reading</p>
                  <p className="font-medium">{formatCurrency(data.vehicle.meterReading)} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">First Registration Date</p>
                  <p className="font-medium">{formatDate(data.vehicle.firstRegDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valuer's Name</p>
                  <p className="font-medium">{data.vehicle.valuerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valuation Amount</p>
                  <p className="font-medium">LKR {formatCurrency(data.vehicle.valuationAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maximum Loan (70%)</p>
                  <p className="font-medium text-blue-600">LKR {formatCurrency(parseFloat(data.vehicle.valuationAmount || 0) * 0.7)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Details */}
        {data.payments && Object.values(data.payments).some(val => val) && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium text-lg mb-3">Payment Details</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 font-medium text-gray-500">Charge Type</th>
                    <th className="text-right pb-2 font-medium text-gray-500">Amount</th>
                    <th className="text-right pb-2 font-medium text-gray-500">Capitalized</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.initialPayment > 0 && (
                    <tr className="border-b">
                      <td className="py-2">Initial Payment</td>
                      <td className="py-2 text-right">LKR {formatCurrency(data.payments.initialPayment)}</td>
                      <td className="py-2 text-right">
                        {data.capitalizedCharges?.initialPayment ? "Yes" : "No"}
                      </td>
                    </tr>
                  )}
                  {data.payments.serviceCharges > 0 && (
                    <tr className="border-b">
                      <td className="py-2">Service Charges</td>
                      <td className="py-2 text-right">LKR {formatCurrency(data.payments.serviceCharges)}</td>
                      <td className="py-2 text-right">
                        {data.capitalizedCharges?.serviceCharges ? "Yes" : "No"}
                      </td>
                    </tr>
                  )}
                  {data.payments.documentationCharges > 0 && (
                    <tr className="border-b">
                      <td className="py-2">Documentation Charges</td>
                      <td className="py-2 text-right">LKR {formatCurrency(data.payments.documentationCharges)}</td>
                      <td className="py-2 text-right">
                        {data.capitalizedCharges?.documentationCharges ? "Yes" : "No"}
                      </td>
                    </tr>
                  )}
                  {data.payments.rmvCharges > 0 && (
                    <tr className="border-b">
                      <td className="py-2">RMV Charges</td>
                      <td className="py-2 text-right">LKR {formatCurrency(data.payments.rmvCharges)}</td>
                      <td className="py-2 text-right">
                        {data.capitalizedCharges?.rmvCharges ? "Yes" : "No"}
                      </td>
                    </tr>
                  )}
                  {data.payments.insuranceCharges > 0 && (
                    <tr className="border-b">
                      <td className="py-2">Insurance Charges</td>
                      <td className="py-2 text-right">LKR {formatCurrency(data.payments.insuranceCharges)}</td>
                      <td className="py-2 text-right">
                        {data.capitalizedCharges?.insuranceCharges ? "Yes" : "No"}
                      </td>
                    </tr>
                  )}
                  {data.payments.otherCharges > 0 && (
                    <tr className="border-b">
                      <td className="py-2">Other Charges</td>
                      <td className="py-2 text-right">LKR {formatCurrency(data.payments.otherCharges)}</td>
                      <td className="py-2 text-right">No</td>
                    </tr>
                  )}
                  <tr className="font-medium">
                    <td className="pt-3">Total</td>
                    <td className="pt-3 text-right">
                      LKR {formatCurrency(
                        parseFloat(data.payments.initialPayment || 0) +
                        parseFloat(data.payments.serviceCharges || 0) +
                        parseFloat(data.payments.documentationCharges || 0) +
                        parseFloat(data.payments.rmvCharges || 0) +
                        parseFloat(data.payments.insuranceCharges || 0) +
                        parseFloat(data.payments.otherCharges || 0)
                      )}
                    </td>
                    <td className="pt-3 text-right">
                      LKR {formatCurrency(totalCapitalizedCharges)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
        
        {/* PDF Document Footer - Only visible in PDF */}
        <div className="hidden pdf-only">
          <div className="text-center py-4 text-sm text-gray-500">
            <p>This document was generated on {new Date().toLocaleDateString()}</p>
            <p className="mt-1">© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      {/* Styles for PDF generation */}
      <style jsx global>{`
        /* These styles will only apply when generating the PDF */
        .generating-pdf .pdf-only {
          display: block !important;
        }
        
        .generating-pdf {
          background-color: white;
          padding: 20px;
        }
        
        @media screen {
          .pdf-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
