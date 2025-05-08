// app/apply-for-equipment-loan/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

// Reused step components from the auto loan flow
import PersonalDetailsStep from "@/components/applyforloan/PersonalDetailsStep";
import BankDetailsStep from "@/components/applyforloan/BankDetailsStep";
import FinancialDetailsStep from "@/components/applyforloan/FinancialDetailsStep";
import GuarantorDetailsStep from "@/components/applyforloan/GuarantorDetailsStep";
import SubmitStep from "@/components/applyforloan/SubmitStep";

// Equipment loan specific components
import EmploymentDetailsStep from "@/components/applyforauto/EmploymentDetailsStep"; // Reusing from auto loan
import EquipmentDetailsStep from "@/components/applyforequipment/EquipmentDetailsStep"; // New component
import EQSupplierDetailsStep from "@/components/applyforequipment/EQSupplierDetailsStep"; // New component
import EQDocumentUploadStep from "@/components/applyforequipment/EQDocumentUploadStep"; // New component
import EQSummaryStep from "@/components/applyforequipment/EQSummaryStep"; // New component

export default function ApplyForEquipmentLoanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const params = useParams()
  const [loanData, setLoanData] = useState({
    // Pre-filled customer data (will be fetched from API)
    loanId: params.id,
    customerId: "",
    CusDisId: "",
    customerName: "",
    customerNic: "",
    idNumber: "",
    gender: "",
    dateOfBirth: "",
    address: {
      line1: "",
      line2: "",
      line3: "",
      city: ""
    },
    location: "",
    gsDivision: "",
    dsOffice: "",
    district: "",
    province: "",
    
    // Employment data
    employmentType: "employee", // employee or business
    companyRegistrationNumber: "",
    businessRegistrationNumber: "",
    businessAddress: "",
    designation: "",
    natureOfBusiness: "",
    experienceYears: "",
    businessPeriod: "",
    companyName: "",
    businessName: "",
    businessType: "",
    employmentTypeDetail: "",
    
    // Personal Details
    residenceType: "Own", // Own, Rented, With parents, Spouse
    utilityBillType: "",
    
    // Spouse details
    spouseName: "",
    spouseRelationship: "",
    spouseAddress: "",
    
    // Bank details
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
    
    // Loan details (modified for Equipment Loan)
    loanType: "SMART_MOBILE",
    loanTypeName: "Smart Mobile Loan",
    devicePrice: "",
    downPayment: "",
    loanAmount: "",
    period: 12,  // Default to 12 months for mobile loans
    periodType: "Months",
    rental: "",
    irrRate: "",
    contractDate: "",
    dueDate: "",
    
    // Financial details
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
    
    // Guarantor details
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
    
    // Equipment details (specific to smart mobile)
    equipment: {
      type: "SMART_MOBILE",
      make: "",
      model: "",
      serialNumber: "",
      imeiNumber: "",
      capacity: "",  // e.g., 128GB
      generation: "", // e.g., iPhone 13, Galaxy S22
      yom: "",       // Year of Manufacture
      valuationAmount: "",
      documents: {
        invoice: null,
        deviceImages: []
      }
    },
    
    // Payment details
    payments: {
      initialPayment: "",
      initialPaymentCapitalized: true,
      serviceCharges: "",
      serviceChargesCapitalized: false,
      documentationCharges: "",
      documentationChargesCapitalized: true,
      otherCharges: ""
    },
    
    // Supplier details
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
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we're just simulating the data loading
    // Later, this will be replaced with actual API calls
    const simulateDataLoading = () => {
      setTimeout(() => {
        setLoanData(prev => ({
          ...prev,
          customerId: "CUST123",
          CusDisId: "CD12345",
          customerName: "John Smith",
          customerNic: "198712345678",
          idNumber: "198712345678",
          gender: "Male",
          dateOfBirth: "1987-05-15",
          address: {
            line1: "123 Main Street",
            line2: "Apt 4B",
            line3: "",
            city: "Colombo"
          },
          location: "Colombo",
          gsDivision: "Colombo Central",
          dsOffice: "Colombo",
          district: "Colombo",
          province: "Western"
        }));
        setLoading(false);
      }, 1000);
    };

    simulateDataLoading();
  }, [params.id]);
  
  // Define steps for Equipment Loan
  const steps = [
    { id: "personal", title: "Personal" },
    { id: "bank", title: "Bank" },
    { id: "employment", title: "Employment" },
    { id: "financial", title: "Financial" },
    { id: "equipment", title: "Equipment" },
    { id: "guarantor", title: "Guarantors" },
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

  const handleNext = () => {
    // No validation for now - we're allowing free navigation
    setCurrentStep(current => Math.min(steps.length - 1, current + 1));
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = () => {
    // For now, just show an alert
    alert("Equipment loan application submitted successfully!");
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
    
    if (currentStep === 0 && loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

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
      case "equipment":
        return (
          <EquipmentDetailsStep 
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
      case "supplier":
        return (
          <EQSupplierDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "documents":
        return (
          <EQDocumentUploadStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "summary":
        return (
          <EQSummaryStep 
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
            Apply for Smart Mobile Loan
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
                  className="bg-green-600 hover:bg-green-700"
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
