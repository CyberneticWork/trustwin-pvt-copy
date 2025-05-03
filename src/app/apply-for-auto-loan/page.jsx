// app/apply-for-auto-loan/page.jsx
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Reused step components from the MBL flow
import PersonalDetailsStep from "@/components/applyforloan/PersonalDetailsStep";
import BankDetailsStep from "@/components/applyforloan/BankDetailsStep";
import FinancialDetailsStep from "@/components/applyforloan/FinancialDetailsStep";
import GuarantorDetailsStep from "@/components/applyforloan/GuarantorDetailsStep";
import DocumentUploadStep from "@/components/applyforloan/DocumentUploadStep";
import SubmitStep from "@/components/applyforloan/SubmitStep";

// Auto loan specific components
import EmploymentDetailsStep from "@/components/applyforauto/EmploymentDetailsStep";
import VehicleDetailsStep from "@/components/applyforauto/VehicleDetailsStep";
import PaymentDetailsStep from "@/components/applyforauto/PaymentDetailsStep";
import SupplierDetailsStep from "@/components/applyforauto/SupplierDetailsStep";
import SummaryStep from "@/components/applyforauto/AutoLoanSummaryStep";

export default function ApplyForAutoLoanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loanData, setLoanData] = useState({
    // Pre-filled customer data (would come from previous steps or context)
    customerId: "C-1234",
    customerName: "Kaduruwanage Lasantha",
    
    // Personal Details (same as MBL)
    idNumber: "197631001622",
    gender: "Male",
    dateOfBirth: "",
    address: {
      line1: "No.259",
      line2: "Pubudu Mw,",
      line3: "K.C.Puraya, Thimbirigaskatuwa,",
      city: "Negombo"
    },
    location: "JE",
    gsDivision: "70B",
    dsOffice: "Katana",
    district: "Gampaha",
    province: "Western",
    
    // Residence details (same as MBL)
    residenceType: "Own", // Own, Rented, With parents, Spouse
    utilityBillType: "",
    
    // Spouse details (same as MBL)
    spouseName: "",
    spouseRelationship: "",
    spouseAddress: "",
    
    // Bank details (same as MBL)
    accountType: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    bankAccountPeriod: "",
    bankTurnover: {
      jan: "",
      feb: "",
      mar: ""
    },
    
    // Loan details (modified for Auto Loan)
    loanType: "AUTO",
    loanTypeName: "Auto Loan",
    vehiclePrice: "",
    downPayment: "",
    loanAmount: "",
    period: 36,
    periodType: "Months",
    rental: "",
    irrRate: "",
    contractDate: "",
    dueDate: "",
    
    // Employment/Business details (renamed from business details)
    natureOfBusinessOrEmployment: "",
    businessOrEmployerName: "",
    businessOrEmployerAddress: "",
    businessRegistrationNo: "",
    businessType: "Proprietorship",
    businessOrEmploymentPeriod: "",
    businessImages: [],
    
    // Financial details (same as MBL)
    income: {
      businessIncome: "",
      salaryIncome: "",
      otherIncome: "",
      interestIncome: ""
    },
    expenses: {
      businessExpenses: "",
      utilityBills: "",
      livingExpenses: "",
      loanPayments: "",
      existingLoanAmount: "",
      otherExpenses: ""
    },
    
    // Guarantor details (same as MBL)
    guarantors: [
      {
        name: "",
        nic: "",
        gender: "",
        dateOfBirth: "",
        relationship: "",
        relationshipOther: "",
        address: "",
        location: "",
        gsDivision: "",
        dsOffice: "",
        district: "",
        province: "",
        mobile: "",
        employment: "",
        income: "",
        accountType: "",
        accountNumber: "",
        bankName: "",
        residenceType: ""
      },
      {
        name: "",
        nic: "",
        gender: "",
        dateOfBirth: "",
        relationship: "",
        relationshipOther: "",
        address: "",
        location: "",
        gsDivision: "",
        dsOffice: "",
        district: "",
        province: "",
        mobile: "",
        employment: "",
        income: "",
        accountType: "",
        accountNumber: "",
        bankName: "",
        residenceType: ""
      }
    ],
    
    // Vehicle details (specific to auto loan)
    vehicle: {
      type: "", // Motor Bike, Car, etc.
      make: "",
      model: "",
      vehicleNo: "",
      chassisNo: "",
      engineNo: "",
      firstRegDate: "",
      engineCapacity: "",
      yom: "", // Year of Manufacture
      meterReading: "",
      valuationAmount: "",
      valuerName: "",
      documents: {
        valuation: null,
        crBook: null,
        vehicleImages: []
      }
    },
    
    // Payment details (for auto loan)
    payments: {
      initialPayment: "",
      initialPaymentCapitalized: true,
      serviceCharges: "",
      serviceChargesCapitalized: false,
      documentationCharges: "",
      documentationChargesCapitalized: true,
      rmvCharges: "",
      rmvChargesCapitalized: false,
      insuranceCharges: "",
      insuranceChargesCapitalized: false,
      otherCharges: ""
    },
    
    // Supplier details (specific to auto loan)
    supplier: {
      name: "",
      brNumber: "",
      idNumber: "",
      accountNumber: "",
      bankName: "",
      branchName: ""
    },
    
    // Investigation images
    investigationImages: {
      residence: [],
      selfie: null
    },
    
    // Submission
    comments: "",
    agreeToTerms: false,
  });
  
  // Define steps for Auto Loan
  const steps = [
    { id: "personal", title: "Personal Details" },
    { id: "bank", title: "Bank Details" },
    { id: "employment", title: "Employment" },
    { id: "financial", title: "Financial" },
    { id: "vehicle", title: "Vehicle" },
    { id: "guarantor", title: "Guarantors" },
    { id: "payment", title: "Payment" },
    { id: "supplier", title: "Supplier" },
    { id: "documents", title: "Documents" },
    { id: "summary", title: "Summary" },
    { id: "submit", title: "Submit" }
  ];

  const handleDataChange = (field, value) => {
    setLoanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedDataChange = (parentField, field, value) => {
    setLoanData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const validateStep = (step) => {
    // Each step component will handle its own validation
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(current => Math.min(steps.length - 1, current + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    if (loanData.agreeToTerms) {
      try {
        // Here you would submit the data to your API
        // const response = await fetch('/api/auto-loan-applications', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(loanData)
        // });
        
        // if (!response.ok) throw new Error('Failed to submit application');
        
        alert("Auto loan application submitted successfully!");
        // Redirect to confirmation page or dashboard
        // router.push('/loan-application-confirmation');
      } catch (error) {
        console.error("Error submitting auto loan application:", error);
        alert("Failed to submit auto loan application. Please try again.");
      }
    } else {
      alert("Please agree to the terms and conditions before submitting.");
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="relative flex w-full justify-between">
          {/* Step connector line - placed underneath the circles */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
          
          {/* Step circles with progress */}
          <div className="relative z-10 flex w-full justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border flex-shrink-0",
                    currentStep === index
                      ? "bg-blue-600 text-white border-blue-600"
                      : currentStep > index
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-400 border-gray-300"
                  )}
                >
                  {currentStep > index ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div 
                  className={cn(
                    "text-xs font-medium text-center mt-2 w-16 md:w-20",
                    currentStep === index
                      ? "text-blue-600"
                      : currentStep > index
                        ? "text-green-500"
                        : "text-gray-500"
                  )}
                >
                  {step.title}
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress overlay for completed sections */}
          {currentStep > 0 && (
            <div 
              className="absolute top-5 left-0 h-0.5 bg-green-500 z-0"
              style={{ 
                width: `${(currentStep / (steps.length - 1)) * 100}%` 
              }}
            ></div>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    const currentStepId = steps[currentStep]?.id;
    
    switch (currentStepId) {
      case "personal":
        return (
          <PersonalDetailsStep 
            data={loanData} 
            onChange={handleDataChange} 
          />
        );
      case "bank":
        return (
          <BankDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "employment":
        return (
          <EmploymentDetailsStep 
            data={loanData} 
            onChange={handleDataChange} 
          />
        );
      case "financial":
        return (
          <FinancialDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "vehicle":
        return (
          <VehicleDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "guarantor":
        return (
          <GuarantorDetailsStep 
            data={loanData} 
            onChange={handleDataChange} 
          />
        );
      case "payment":
        return (
          <PaymentDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "supplier":
        return (
          <SupplierDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "documents":
        return (
          <DocumentUploadStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "summary":
        return (
          <SummaryStep 
            data={loanData} 
          />
        );
      case "submit":
        return (
          <SubmitStep 
            data={loanData} 
            onChange={handleDataChange} 
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Apply for Auto Loan
          </h1>
          <p className="text-sm text-gray-500">
            Complete the application form to apply for {loanData.loanTypeName}
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {renderCurrentStep()}
            </CardContent>
            <CardFooter className="flex justify-between px-6 pb-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="flex items-center"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!loanData.agreeToTerms}
                  className={cn(
                    "bg-green-600 hover:bg-green-700",
                    !loanData.agreeToTerms && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Submit Application
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
