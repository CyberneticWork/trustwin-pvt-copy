// app/apply-for-auto-loan/page.jsx
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
// Reused step components from the MBL flow
import PersonalDetailsStep from "@/components/applyforauto/PersonalDetailsStep";
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
  const params = useParams()
  const [loanData, setLoanData] = useState({
    // Pre-filled customer data (will be fetched from API)
    loanId: params.id, // Add loanId from URL parameters
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
    employmentType: "employee",
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
    // Personal Details (same as MBL)
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
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await fetch(`/api/loan/auto/details?id=${params.id}`);
        const data = await response.json();

        if (data.code === 'SUCCESS') {
          const customerData = data.data.customer;
          const loanData = data.data.loan;

          setLoanData(prev => ({
            ...prev,
            customerId: customerData.id,
            CusDisId: customerData.CusDisId,
            customerName: customerData.fullname,
            customerNic: customerData.nic,
            idNumber: customerData.nic,
            gender: customerData.gender === 1 ? 'Male' : 'Female',
            dateOfBirth: customerData.dob,
            address: {
              line1: customerData.address,
              line2: '',
              line3: '',
              city: customerData.location
            },
            location: customerData.location,
            gsDivision: customerData.gs,
            dsOffice: customerData.ds,
            district: customerData.district,
            province: customerData.province
          }));
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [params.id]);
  
  // Define steps for Auto Loan
  
  const steps = [
    { id: "personal", title: "Personal Details" },
    { id: "bank", title: "Bank Details" },
    { id: "employment", title: "Employment" },
    { id: "financial", title: "Financial" },
    { id: "vehicle", title: "Vehicle" },
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

  const validateStep = (step) => {
    // Each step component will handle its own validation
    return true;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      // Skip the payment step if we're on the guarantor step
      if (currentStep === steps.findIndex(step => step.id === "guarantor")) {
        setCurrentStep(prev => prev + 2);
        return;
      }
      
      if (currentStep === 0) {
        try {
          const response = await fetch('/api/loan/auto/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: params.id,
              residenceType: loanData.residenceType,
              utilityBillType: loanData.utilityBillType
            })
          });

          const data = await response.json();

          if (data.code === 'ERROR') {
            alert(data.message);
            return;
          }
        } catch (error) {
          console.error('Error updating loan application:', error);
          alert('Failed to update loan application. Please try again.');
          return;
        }
      } else if (currentStep === 4) { // Vehicle details step
        // Handle vehicle details submission through the component's save method
        try {
          const vehicleStepComponent = document.querySelector('[data-vehicle-step]');
          if (vehicleStepComponent && vehicleStepComponent.saveVehicleDetails) {
            const success = await vehicleStepComponent.saveVehicleDetails(
              loanData.customerId,
              params.id
            );
            if (!success) return;
          }
        } catch (error) {
          console.error('Error saving vehicle details:', error);
          alert(error.message || 'Failed to save vehicle details. Please try again.');
          return;
        }
      } else if (currentStep === 1) { // Bank details step
        try {
          console.log('Saving bank details...');
          console.log(loanData);
          
          const response = await fetch('/api/loan/auto/bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: loanData.customerId,
              loanId: params.id,
              bankData: {
                acctype: loanData.accountType,
                bank: loanData.bankName,
                acno: loanData.accountNumber,
                branch: loanData.branchName,
                period: loanData.bankAccountPeriod,
                month1: parseFloat(loanData.bankTurnover.month1) || 0,
                month2: parseFloat(loanData.bankTurnover.month2) || 0,
                month3: parseFloat(loanData.bankTurnover.month3) || 0
              }
            })
          });

          const data = await response.json();
          console.log('Bank details response:', data);

          if (data.code === 'ERROR') {
            alert(data.message);
            return;
          }
        } catch (error) {
          console.error('Error saving bank details:', error);
          alert('Failed to save bank details. Please try again.');
          return;
        }
      } else if (currentStep === 2) { // Employment details step
        try {
          console.log('Employment type:', loanData.employmentType);
          
          const response = await fetch('/api/loan/auto/employment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
              customerId: loanData.customerId,
              loanId: params.id,
              employmentData: {
                employmentType: loanData.employmentType,
                companyRegistrationNumber: loanData.employmentType === 'employee' 
                  ? loanData.companyRegistrationNumber 
                  : null,
                businessRegistrationNumber: loanData.employmentType === 'employee' 
                  ? null 
                  : loanData.businessRegistrationNo,
                businessAddress: loanData.businessAddress,
                designation: loanData.employmentType === 'employee' 
                  ? loanData.designation 
                  : null,
                natureOfBusiness: loanData.employmentType === 'employee' 
                  ? loanData.designation 
                  : loanData.natureOfBusiness,
                experienceYears: loanData.employmentType === 'employee' 
                  ? loanData.experienceYears 
                  : null,
                businessPeriod: loanData.employmentType === 'employee' 
                  ? null 
                  : loanData.businessPeriod,
                companyName: loanData.employmentType === 'employee' 
                  ? loanData.companyName 
                  : null,
                businessName: loanData.employmentType === 'employee' 
                  ? null 
                  : loanData.businessName,
                businessType: loanData.employmentType === 'employee' 
                  ? loanData.businessType 
                  : null,
                employmentTypeDetail: loanData.employmentType === 'employee' 
                  ? null 
                  : loanData.employmentTypeDetail
              }
            })
          });
          console.log('Employment Data:', loanData.employmentData);

          const data = await response.json();

          if (data.code === 'ERROR') {
            alert(data.message);
            return;
          }
        } catch (error) {
          console.error('Error saving employment details:', error);
          alert('Failed to save employment details. Please try again.');
          return;
        }
      } else if (currentStep === 5) { // Guarantor details step
        try {
          console.log('Saving guarantor details...');
          console.log(loanData.guarantors);
          
          // Save each guarantor one by one
          for (const guarantor of loanData.guarantors) {
            if (!guarantor.name || !guarantor.nic) continue; // Skip empty guarantors
            
            const response = await fetch('/api/loan/auto/guarantor', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: loanData.customerId,
                loanId: params.id,
                guarantorData: {
                  name: guarantor.name,
                  nic: guarantor.nic,
                  gender: guarantor.gender,
                  dateOfBirth: guarantor.dateOfBirth,
                  relationship: guarantor.relationship,
                  relationshipOther: guarantor.relationshipOther,
                  address: guarantor.address,
                  province: guarantor.province,
                  gsDivision: guarantor.gsDivision,
                  dsOffice: guarantor.dsOffice,
                  district: guarantor.district,
                  mobile: guarantor.mobile,
                  income: guarantor.income,
                  employment: guarantor.employment,
                  accountNumber: guarantor.accountNumber,
                  bankName: guarantor.bankName,
                  residenceType: guarantor.residenceType
                }
              })
            });

            const data = await response.json();
            console.log('Guarantor details response:', data);

            if (data.code === 'ERROR') {
              alert(data.message);
              return;
            }
          }
        } catch (error) {
          console.error('Error saving guarantor details:', error);
          alert('Failed to save guarantor details. Please try again.');
          return;
        }
      } else if (currentStep === 3) { // Financial details step
        try {
          console.log('Saving financial details...');
          console.log(loanData);
          
          const response = await fetch('/api/loan/auto/financial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: loanData.customerId,
              loanId: params.id,
              financialData: {
                Bincume: parseFloat(loanData.income.businessIncome) || 0,
                Sincume: parseFloat(loanData.income.salaryIncome) || 0,
                Oincome: parseFloat(loanData.income.otherIncome) || 0,
                Iincome: parseFloat(loanData.income.interestIncome) || 0,
                Bexpence: parseFloat(loanData.expenses.businessExpenses) || 0,
                utilitybill: parseFloat(loanData.expenses.utilityBills) || 0,
                livinexpence: parseFloat(loanData.expenses.livingExpenses) || 0,
                exiLopayment: parseFloat(loanData.expenses.loanPayments) || 0,
                exiloanamountMon: parseFloat(loanData.expenses.existingLoanAmount) || 0,
                otherexpe: parseFloat(loanData.expenses.otherExpenses) || 0
              }
            })
          });

          const data = await response.json();

          if (data.code === 'ERROR') {
            alert(data.message);
            return;
          }
        } catch (error) {
          console.error('Error saving financial details:', error);
          alert('Failed to save financial details. Please try again.');
          return;
        }
      } else if (currentStep === 7) { // Supplier details step
        try {
          console.log('Saving supplier details...');
          console.log(loanData.supplier);
          
          const response = await fetch('/api/loan/auto/supplier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: loanData.customerId,
              loanId: params.id,
              supplierData: {
                name: loanData.supplier.name,
                brNumber: loanData.supplier.brNumber,
                idNumber: loanData.supplier.idNumber,
                accountNumber: loanData.supplier.accountNumber,
                bankName: loanData.supplier.bankName,
                branchName: loanData.supplier.branchName
              }
            })
          });

          const data = await response.json();
          console.log('Supplier details response:', data);

          if (data.code === 'ERROR') {
            alert(data.message);
            return;
          }
        } catch (error) {
          console.error('Error saving supplier details:', error);
          alert('Failed to save supplier details. Please try again.');
          return;
        }
      } else if (currentStep === steps.findIndex(step => step.id === 'documents')) {
        try {
          // Get all documents that need to be uploaded from investigationImages
          const documents = [];
          
          // Add residence images
          if (loanData.investigationImages?.residence) {
            if (Array.isArray(loanData.investigationImages.residence)) {
              loanData.investigationImages.residence.forEach((file, index) => {
                if (file) documents.push({ type: 'residence', file, index });
              });
            } else if (loanData.investigationImages.residence) {
              documents.push({ type: 'residence', file: loanData.investigationImages.residence });
            }
          }
          
          // Add selfie
          if (loanData.investigationImages?.selfie) {
            documents.push({ type: 'selfie', file: loanData.investigationImages.selfie });
          }

          // Upload each document
          for (const doc of documents) {
            const formData = new FormData();
            formData.append('loanId', params.id);
            formData.append('customerId', loanData.customerId);
            formData.append('documentType', doc.type);
            formData.append('file', doc.file);
            
            // Add index for multiple files of the same type
            if (doc.index !== undefined) {
              formData.append('index', doc.index);
            }

            const response = await fetch('/api/loan/auto/upload-document', {
              method: 'POST',
              body: formData
            });

            const result = await response.json();
            
            if (result.code !== 'SUCCESS') {
              throw new Error(result.message || `Failed to upload ${doc.type} document`);
            }

            console.log(`Successfully uploaded ${doc.type} document`);
          }
        } catch (error) {
          console.error('Error uploading documents:', error);
          alert(error.message || 'Failed to upload documents. Please try again.');
          return;
        }
      }

      setCurrentStep(current => Math.min(steps.length - 1, current + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    // No need to check agreeToTerms since we removed the checkbox
    // The button will always be enabled

    try {
      const response = await fetch('/api/loan/auto/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: params.id,
          customerId: loanData.customerId,
          comments: loanData.comments || '', // Make comments optional
          status: 'pending'   
        })
      });

      const result = await response.json();

      if (result.code !== 'SUCCESS') {
        throw new Error(result.message || 'Failed to submit application');
      }
      
      alert("Auto loan application submitted successfully for admin approval!");
      // Redirect to confirmation page or dashboard
      // router.push('/loan-application-confirmation');
    } catch (error) {
      console.error("Error submitting auto loan application:", error);
      alert(error.message || "Failed to submit auto loan application. Please try again.");
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
          <div>
            <PersonalDetailsStep 
              data={loanData} 
              onChange={handleDataChange} 
            />
          </div>
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
