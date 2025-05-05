
// app/apply-for-loan/page.jsx
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Step components
import PersonalDetailsStep from "@/components/applyforloan/PersonalDetailsStep";
import BankDetailsStep from "@/components/applyforloan/BankDetailsStep";
import BusinessDetailsStep from "@/components/applyforloan/BusinessDetailsStep";
import FinancialDetailsStep from "@/components/applyforloan/FinancialDetailsStep";
import GuarantorDetailsStep from "@/components/applyforloan/GuarantorDetailsStep";
import LoanDetailsStep from "@/components/applyforloan/LoanDetailsStep";
import VehicleDetailsStep from "@/components/applyforloan/VehicleDetailsStep";
import DocumentUploadStep from "@/components/applyforloan/DocumentUploadStep";
import PaymentDetailsStep from "@/components/applyforloan/PaymentDetailsStep";
import SummaryStep from "@/components/applyforloan/SummaryStep";
import SubmitStep from "@/components/applyforloan/SubmitStep";

export default function ApplyForLoanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loanData, setLoanData] = useState({
    submitted: false,

    customerId: "",
    customerName: "",
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
    residenceType: "Own",
    utilityBillType: "",
    spouseName: "",
    spouseRelationship: "",
    spouseAddress: "",
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
    loanType: "",
    loanTypeName: "",
    loanAmount: 0,
    period: 0,
    periodType: "Weeks",
    rental: 0,
    contractDate: "",
    dueDate: "",
    natureOfBusiness: "",
    businessName: "",
    businessRegistrationNo: "",
    businessType: "Proprietorship",
    businessPeriod: "",
    businessImages: [],
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
    vehicle: {
      type: "",
      make: "",
      model: "",
      vehicleNo: "",
      chassisNo: "",
      engineNo: "",
      firstRegDate: "",
      engineCapacity: "",
      meterReading: "",
      valuationAmount: "",
      valuerName: "",
      documents: {
        valuation: null,
        crBook: null,
        vehicleImages: []
      }
    },
    payments: {
      initialPayment: "",
      serviceCharges: "",
      documentationCharges: "",
      rmvCharges: "",
      insuranceCharges: "",
      otherCharges: ""
    },
    investigationImages: {
      business: [],
      residence: [],
      selfie: null
    },
    comments: "",
    agreeToTerms: false
  });

  useEffect(() => {
    // Get the business ID from the URL
    const businessId = window.location.pathname.split('/').pop();
    
    if (businessId) {
      const fetchDetails = async () => {
        try {
          const response = await fetch(`/api/loan/business/details?id=${businessId}`);
          const result = await response.json();
          console.log(result.data.customer.clientId);
          if (result.success && result.data) {
            const { customer, loan } = result.data;
            setLoanData({
              customerId: customer.id,
              CusDisId: customer.clientId,
              loanid: loan.id,
              customerName: customer.fullName,
              idNumber: customer.nic,
              gender: customer.gender === 1 ? "Male" : "Female",
              dateOfBirth: customer.dob,
              address: {
                line1: customer.address,
                line2: "",
                line3: "",
                city: customer.location
              },
              location: customer.location,
              gsDivision: customer.gs,
              dsOffice: customer.ds,
              district: customer.district,
              province: customer.province,
              loanType: loan.type,
              loanTypeName: loan.type,
              loanAmount: loan.amount,
              period: loan.term,
              periodType: "Weeks",
              rental: loan.installment,
              comments: `Rate: ${loan.rate}% | Initial Payment: ${loan.initialPayment} ${loan.initialPaymentType}`,
              residenceType: "Own",
              utilityBillType: "",
              spouseName: "",
              spouseRelationship: "",
              spouseAddress: "",
              accountType: "",
              accountNumber: "",
              bankName: "",
              branchName: "",
              bankAccountPeriod: "",
              bankTurnover: {
                m1: "",
                m2: "",
                m3: ""
              },
              contractDate: "",
              dueDate: "",
              natureOfBusiness: "",
              businessName: "",
              businessRegistrationNo: "",
              businessType: "Proprietorship",
              businessPeriod: "",
              businessImages: [],
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
              vehicle: {
                type: "",
                make: "",
                model: "",
                vehicleNo: "",
                chassisNo: "",
                engineNo: "",
                firstRegDate: "",
                engineCapacity: "",
                meterReading: "",
                valuationAmount: "",
                valuerName: "",
                documents: {
                  valuation: null,
                  crBook: null,
                  vehicleImages: []
                }
              },
              payments: {
                initialPayment: "",
                serviceCharges: "",
                documentationCharges: "",
                rmvCharges: "",
                insuranceCharges: "",
                otherCharges: ""
              },
              investigationImages: {
                business: [],
                residence: [],
                selfie: null
              },
              agreeToTerms: false
            });
          }
        } catch (error) {
          console.error("Error fetching details:", error);
        }
      };

      fetchDetails();
    }
  }, []);

  const [steps, setSteps] = useState([]);

  useEffect(() => {
    // Define steps based on loan type
    if (loanData.loanType === "AUTO") {
      setSteps([
        { id: "personal", title: "Personal Details" },
        { id: "bank", title: "Bank Details" },
        { id: "business", title: "Employment" },
        { id: "financial", title: "Financial" },
        { id: "vehicle", title: "Vehicle" },
        { id: "guarantor", title: "Guarantors" },
        { id: "payment", title: "Payment" },
        { id: "documentation", title: "Documents" },
        { id: "summary", title: "Summary" },
        { id: "submit", title: "Submit" },
      ]);
    } else {
      // MBL or other loan types
      setSteps([
        { id: "personal", title: "Personal Details" },
        { id: "bank", title: "Bank Details" },
        { id: "business", title: "Business" },
        { id: "financial", title: "Financial" },
        { id: "guarantor", title: "Guarantors" },
        { id: "loan", title: "Loan Details" },
        { id: "documentation", title: "Documents" },
        { id: "summary", title: "Summary" },
        { id: "submit", title: "Submit" },
      ]);
    }
  }, [loanData.loanType]);

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

  const handleNext = async () => {
    if (steps[currentStep]?.id === "personal") {
      try {
        const response = await fetch('/api/loan/business/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            loanId: loanData.loanid,
            residentType: loanData.residenceType,
            utilityBillType: loanData.utilityBillType
          })
        });
        const result = await response.json();
        if (result.code === "SUCCESS") {
          setCurrentStep(current => Math.min(steps.length - 1, current + 1));
        } else {
          alert(result.message || "Failed to save personal details");
        }
      } catch (error) {
        console.error("Error saving personal details:", error);
        alert("Failed to save personal details. Please try again.");
      }
    } else if (steps[currentStep]?.id === "business") {
      try {
        // Create form data with loanId
        const formData = new FormData();
        formData.append('loanId', loanData.loanid);

        // Add all images that are selected
        for (let i = 0; i < 3; i++) {
          if (loanData.businessImages?.[i]) {
            formData.append(`image${i + 1}`, loanData.businessImages[i]);
          }
        }

        // Send to the upload API
        const response = await fetch('/api/loan/business/upload', {
          method: 'POST',
          body: formData
        });
        

        const result = response;
        
        if (result.status === 200) {
          setCurrentStep(current => Math.min(steps.length - 1, current + 1));
        } else {
          throw new Error(result.message || "Failed to upload business images");
        }
      } catch (error) {
        console.error("Error uploading business images:", error);
        alert(error.message || "Failed to upload business images. Please try again.");
      }
    } else if (steps[currentStep]?.id === "documentation") {
      try {
        // Get all documents that need to be uploaded from investigationImages
        const documents = Object.entries(loanData.investigationImages || {})
          .filter(([doctype, file]) => file)
          .map(([doctype, file]) => ({ doctype, file }));

        // Upload each document
        for (const { doctype, file } of documents) {
          // Create form data for this document
          const formData = new FormData();
          formData.append('loanId', loanData.loanid);
          formData.append('doctype', doctype);
          formData.append('file', file);

          // Send to the documentation upload API
          const response = await fetch('/api/loan/documentation/upload', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          
          if (result.code !== "SUCCESS") {
            throw new Error(result.message || `Failed to upload ${doctype} document`);
          }

          // Update UI to show progress
          console.log(`Successfully uploaded ${doctype} document`);
        }

        // All documents uploaded successfully, move to next step
        setCurrentStep(current => Math.min(steps.length - 1, current + 1));
      } catch (error) {
        console.error("Error uploading documentation:", error);
        alert(error.message || "Failed to upload documentation. Please try again.");
        // Don't move to next step if there's an error
        return;
      }
    } else {
      setCurrentStep(current => Math.min(steps.length - 1, current + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    try {
      // Format and update loan ID
      const formatResponse = await fetch('/api/loan/format-loan-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          customerId: loanData.customerId,
          loanType: loanData.loanType,
          loanId: loanData.loanid,
          periodType: loanData.periodType
        })
      });

      const formatResult = await formatResponse.json();
      
      if (formatResult.code !== "SUCCESS") {
        throw new Error(formatResult.message || "Failed to format loan ID");
      }

      // Submit the loan application
      const response = await fetch('/api/loan/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loanData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Mark as submitted
        setLoanData(prev => ({
          ...prev,
          submitted: true
        }));
        
        alert("Loan application submitted successfully!\nLoan ID: " + formatResult.formattedLoanId);
        // You can redirect to a confirmation page or show the loan ID
        // router.push(`/loan/application/${result.loanId}`);
      } else {
        throw new Error(result.error || 'Failed to submit loan application');
      }
    } catch (error) {
      console.error("Error submitting loan application:", error);
      alert(error.message || "Failed to submit loan application. Please try again.");
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
    if (steps.length === 0) return <div>Loading...</div>;
    
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
      case "business":
        return (
          <BusinessDetailsStep 
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
      case "guarantor":
        return (
          <GuarantorDetailsStep 
            data={loanData} 
            onChange={handleDataChange} 
          />
        );
      case "loan":
        return (
          <LoanDetailsStep 
            data={loanData} 
            onChange={handleDataChange} 
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
      case "payment":
        return (
          <PaymentDetailsStep 
            data={loanData} 
            onChange={handleDataChange}
            onNestedChange={handleNestedDataChange}
          />
        );
      case "documentation":
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
            Apply for Loan
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
                  {loanData.submitted ? "Submitted" : "Submit Application"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}