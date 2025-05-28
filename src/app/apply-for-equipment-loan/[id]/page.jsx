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
import EmploymentDetailsStep from "@/components/applyforauto/EmploymentDetailsStep"; 
import EquipmentDetailsStep from "@/components/applyforequipment/EquipmentDetailsStep";
import EQSupplierDetailsStep from "@/components/applyforequipment/EQSupplierDetailsStep";
import EQDocumentUploadStep from "@/components/applyforequipment/EQDocumentUploadStep"; 
import EQSummaryStep from "@/components/applyforequipment/EQSummaryStep"; 

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
    const fetchCustomerDetails = async () => {
      try {
        const response = await fetch(`/api/EQloan/details?id=${params.id}`);
        console.log(response);
        
        const data = await response.json();
        console.log(data);
        
        if (data.code === 'SUCCESS') {
          const customerData = data.data.customer;
          const loanDataFromApi = data.data.loan;
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

  const handleNext = async () => {
    // Step-wise API integration, similar to auto loan flow
    const currentStepId = steps[currentStep]?.id;
    try {
      if (currentStepId === 'personal') {
        // Save personal details
        const response = await fetch('/api/EQloan/update', {

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
      } else if (currentStepId === 'bank') {
        // Save bank details
        const response = await fetch('/api/EQloan/bank', {
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
        if (data.code === 'ERROR') {
          alert(data.message);
          return;
        }
      } else if (currentStepId === 'employment') {
        // Save employment details
        console.log(loanData.customerId);

        try {
          console.log('Employment type:', loanData.employmentType);
          const response = await fetch('/api/EQloan/employment', {
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
      } else if (currentStepId === 'financial') {
        // Save financial details
        const response = await fetch('/api/EQloan/financial', {
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
      } else if (currentStepId === 'equipment') {
        // Step 1: Validate required fields before sending
        console.log('Equipment data:', loanData.equipment);
        const requiredFields = [
          loanData.customerId,
          params.id,
          loanData.equipment.make,
          loanData.equipment.model,
          loanData.equipment.serialNumber,
          loanData.equipment.capacity,
          loanData.equipment.generation,
          loanData.equipment.yom,
          loanData.equipment.valuationAmount,
          loanData.equipment.devicePrice,
          loanData.equipment.downPayment
        ];
        console.log('Required fields:', requiredFields);
        const missingFields = [
          !loanData.customerId && 'customerId',
          !params.id && 'loanId',
          !loanData.equipment.make && 'make',
          !loanData.equipment.model && 'model',
          !loanData.equipment.serialNumber && 'serialNumber',
          !loanData.equipment.capacity && 'capacity',
          !loanData.equipment.generation && 'generation',
          !loanData.equipment.yom && 'yom',
          !loanData.equipment.valuationAmount && 'valuationAmount',
          !loanData.equipment.devicePrice && 'devicePrice',
          !loanData.equipment.downPayment && 'downPayment'
        ].filter(Boolean);
        if (missingFields.length > 0) {
          alert('[ERROR] Missing required fields: ' + missingFields.join(', '));
          return;
        }
        // Step 2: Build and log payload
        const equipmentPayload = {
          customerId: loanData.customerId,
          loanId: params.id,
          equipmentData: {
            make: loanData.equipment.make,
            model: loanData.equipment.model,
            serialNumber: loanData.equipment.serialNumber,
            capacity: loanData.equipment.capacity,
            generation: loanData.equipment.generation,
            yom: loanData.equipment.yom,
            valuationAmount: loanData.equipment.valuationAmount,
            devicePrice: loanData.equipment.devicePrice,
            downPayment: loanData.equipment.downPayment
          }
        };
        console.log('[Equipment Step] Sending payload:', equipmentPayload);
        // alert('[DEBUG] Sending equipment data to backend:\n' + JSON.stringify(equipmentPayload, null, 2));
        // Step 3: Send to backend
        const response = await fetch('/api/EQloan/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipmentPayload)
        });
        const data = await response.json();
        console.log('[Equipment Step] Save response:', data);
        // alert('\n' + JSON.stringify(data, null, 2));
        // Step 4: Only proceed if save is confirmed
        if (data.code === 'ERROR') {
          alert('[ERROR] ' + data.message);
          return;
        }
        alert('Equipment details saved successfully!');
      } else if (currentStepId === 'guarantor') {
        // Save guarantor details
        for (const guarantor of loanData.guarantors) {
          if (!guarantor.name || !guarantor.nic) continue;
          const response = await fetch('/api/EQloan/guarantor', {
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
          if (data.code === 'ERROR') {
            alert(data.message);
            return;
          }
        }
      } else if (currentStepId === 'supplier') {
        // Save supplier details
        const response = await fetch('/api/EQloan/supplier', {
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
        if (data.code === 'ERROR') {
          alert(data.message);
          return;
        }
      } else if (currentStepId === 'documents') {
        // Upload documents
        const documents = [];
        if (loanData.investigationImages?.residence) {
          if (Array.isArray(loanData.investigationImages.residence)) {
            loanData.investigationImages.residence.forEach((file, index) => {
              if (file) documents.push({ type: 'residence', file, index });
            });
          } else if (loanData.investigationImages.residence) {
            documents.push({ type: 'residence', file: loanData.investigationImages.residence });
          }
        }
        if (loanData.investigationImages?.selfie) {
          documents.push({ type: 'selfie', file: loanData.investigationImages.selfie });
        }
        for (const doc of documents) {
          const formData = new FormData();
          formData.append('loanId', params.id);
          formData.append('customerId', loanData.customerId);
          formData.append('documentType', doc.type);
          formData.append('file', doc.file);
          if (doc.index !== undefined) {
            formData.append('index', doc.index);
          }
          const response = await fetch('/api/EQloan/upload-document', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.code !== 'SUCCESS') {
            throw new Error(result.message || `Failed to upload ${doc.type} document`);
          }
        }
      }
      setCurrentStep(current => Math.min(steps.length - 1, current + 1));
    } catch (error) {
      alert(error.message || 'Failed to proceed. Please try again.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/EQloan/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: params.id,
          customerId: loanData.customerId,
          comments: loanData.comments || '',
          status: 'pending'
        })
      });
      const result = await response.json();
      if (result.code !== 'SUCCESS') {
        throw new Error(result.message || 'Failed to submit application');
      }
      alert("Equipment loan application submitted successfully for admin approval!");
      // Optionally redirect here
    } catch (error) {
      alert(error.message || 'Failed to submit equipment loan application. Please try again.');
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
