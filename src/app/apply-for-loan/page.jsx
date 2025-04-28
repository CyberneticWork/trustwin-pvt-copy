// app/apply-for-loan/page.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ChevronLeft, ChevronRight, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApplyForLoanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loanApplicationData, setLoanApplicationData] = useState({
    // Pre-filled from previous steps (create customer & choose loan type)
    customerId: "C-1234",
    customerName: "Kaduruwanage Lasantha",
    loanType: "MBL",
    loanTypeName: "Micro Business Loan",
    loanAmount: 100000,
    period: 12,
    periodType: "Weeks",
    rental: 5400,

    // Income details
    natureOfBusiness: "",
    businessName: "",
    businessRegistrationNo: "",
    businessType: "Proprietorship",
    businessPeriod: "",
    businessImages: [],

    // Income & expenses
    businessIncome: "",
    salaryIncome: "",
    otherIncome: "",
    interestIncome: "",
    businessExpenses: "",
    utilityBills: "",
    livingExpenses: "",
    loanPayments: "",
    existingLoanAmount: "",
    otherExpenses: "",

    // Guarantor details
    guarantorName: "",
    guarantorNIC: "",
    guarantorRelationship: "",
    guarantorAddress1: "",
    guarantorMobile: "",
    guarantorEmployment: "",
    guarantorIncome: "",

    // Admin submission
    comments: "",
    agreeToTerms: false,
  });


  // Field Errors

  const [fieldErrors, setFieldErrors] = useState({
    guarantorNIC: '',
    guarantorMobile: ''
  });

  // Calculated values
  const totalIncome =
    parseFloat(loanApplicationData.businessIncome || 0) +
    parseFloat(loanApplicationData.salaryIncome || 0) +
    parseFloat(loanApplicationData.otherIncome || 0) +
    parseFloat(loanApplicationData.interestIncome || 0);

  const totalExpenses =
    parseFloat(loanApplicationData.businessExpenses || 0) +
    parseFloat(loanApplicationData.utilityBills || 0) +
    parseFloat(loanApplicationData.livingExpenses || 0) +
    parseFloat(loanApplicationData.loanPayments || 0) +
    parseFloat(loanApplicationData.existingLoanAmount || 0) +
    parseFloat(loanApplicationData.otherExpenses || 0);

  const netIncome = totalIncome - totalExpenses;

  const steps = [
    { id: "income", title: "Income Details" },
    { id: "guarantor", title: "Add Guarantor" },
    { id: "summary", title: "Summary" },
    { id: "submit", title: "Submit" },
  ];

  const handleChange = (field, value) => {
    setLoanApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate if the current section has all required fields filled
  const validateStep = (step) => {
    if (step === 0) {
      // Income details validation
      const isIncomeComplete = Boolean(
        loanApplicationData.natureOfBusiness &&
        loanApplicationData.businessIncome &&
        (parseFloat(loanApplicationData.businessIncome) > 0)
      );
      return isIncomeComplete;
    }
    else if (step === 1) {
      // Guarantor details validation
      const isGuarantorComplete = Boolean(
        loanApplicationData.guarantorName &&
        loanApplicationData.guarantorNIC &&
        loanApplicationData.guarantorRelationship &&
        loanApplicationData.guarantorAddress1 &&
        loanApplicationData.guarantorMobile
      );
      return isGuarantorComplete;
    }
    else if (step === 2) {
      // Summary review - always valid
      return true;
    }
    else if (step === 3) {
      // Submit validation
      return loanApplicationData.agreeToTerms;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(current => current + 1);
    } else {
      alert("Please fill in all required fields before proceeding.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = () => {
    if (loanApplicationData.agreeToTerms) {
      // Here you would normally submit to your API
      alert("Loan application submitted successfully!");
      // Redirect or show success message
    } else {
      alert("Please agree to the terms and conditions before submitting.");
    }
  };

  // Format currency to LKR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace("LKR", "").trim();
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border",
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
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-1 w-16 sm:w-32 md:w-40",
                    currentStep > index ? "bg-green-500" : "bg-gray-200"
                  )}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div
              key={`label-${step.id}`}
              className={cn(
                "text-xs font-medium text-center",
                currentStep === index
                  ? "text-blue-600"
                  : currentStep > index
                    ? "text-green-500"
                    : "text-gray-500"
              )}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderIncomeDetails = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business & Income Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-md font-medium">Business Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="natureOfBusiness" className="text-sm font-medium">
                  Nature of Business <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="natureOfBusiness"
                  value={loanApplicationData.natureOfBusiness}
                  onChange={(e) => handleChange('natureOfBusiness', e.target.value)}
                  placeholder="e.g. Retail, Manufacturing, Services"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNo" className="text-sm font-medium">
                  Registration Number
                </Label>
                <Input
                  id="businessRegistrationNo"
                  value={loanApplicationData.businessRegistrationNo}
                  onChange={(e) => handleChange('businessRegistrationNo', e.target.value)}
                  placeholder="Business registration number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm font-medium">
                  Type of Business
                </Label>
                <Select
                  value={loanApplicationData.businessType}
                  onValueChange={(value) => handleChange('businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPeriod" className="text-sm font-medium">
                  Period of Business (months)
                </Label>
                <Input
                  id="businessPeriod"
                  type="number"
                  value={loanApplicationData.businessPeriod}
                  onChange={(e) => handleChange('businessPeriod', e.target.value)}
                  placeholder="e.g. 36"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business Name
              </Label>
              <Input
                id="businessName"
                value={loanApplicationData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Enter business name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Upload Business Images
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Upload 1 */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 relative">
                  <input
                    type="file"
                    id="businessImage1"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // Clone the current images array
                        const updatedImages = [...loanApplicationData.businessImages];
                        updatedImages[0] = e.target.files[0];
                        handleChange('businessImages', updatedImages);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center">
                    {loanApplicationData.businessImages[0] ? (
                      <>
                        <img
                          src={URL.createObjectURL(loanApplicationData.businessImages[0])}
                          alt="Business"
                          className="h-20 w-20 object-cover mb-2"
                        />
                        <p className="text-xs text-gray-500">
                          {loanApplicationData.businessImages[0].name.substring(0, 15)}
                          {loanApplicationData.businessImages[0].name.length > 15 ? '...' : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload Image 1</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Upload 2 */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 relative">
                  <input
                    type="file"
                    id="businessImage2"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const updatedImages = [...loanApplicationData.businessImages];
                        updatedImages[1] = e.target.files[0];
                        handleChange('businessImages', updatedImages);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center">
                    {loanApplicationData.businessImages[1] ? (
                      <>
                        <img
                          src={URL.createObjectURL(loanApplicationData.businessImages[1])}
                          alt="Business"
                          className="h-20 w-20 object-cover mb-2"
                        />
                        <p className="text-xs text-gray-500">
                          {loanApplicationData.businessImages[1].name.substring(0, 15)}
                          {loanApplicationData.businessImages[1].name.length > 15 ? '...' : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload Image 2</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Upload 3 */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 relative">
                  <input
                    type="file"
                    id="businessImage3"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const updatedImages = [...loanApplicationData.businessImages];
                        updatedImages[2] = e.target.files[0];
                        handleChange('businessImages', updatedImages);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center">
                    {loanApplicationData.businessImages[2] ? (
                      <>
                        <img
                          src={URL.createObjectURL(loanApplicationData.businessImages[2])}
                          alt="Business"
                          className="h-20 w-20 object-cover mb-2"
                        />
                        <p className="text-xs text-gray-500">
                          {loanApplicationData.businessImages[2].name.substring(0, 15)}
                          {loanApplicationData.businessImages[2].name.length > 15 ? '...' : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload Image 3</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Income & Expenses Statement */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Income & Expense Statement</h3><br />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Income Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Income</h4>

                <div className="space-y-2">
                  <Label htmlFor="businessIncome" className="text-sm">
                    Business Income <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="businessIncome"
                      type="number"
                      value={loanApplicationData.businessIncome}
                      onChange={(e) => handleChange('businessIncome', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryIncome" className="text-sm">
                    Salary Income
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="salaryIncome"
                      type="number"
                      value={loanApplicationData.salaryIncome}
                      onChange={(e) => handleChange('salaryIncome', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherIncome" className="text-sm">
                    Other Income
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="otherIncome"
                      type="number"
                      value={loanApplicationData.otherIncome}
                      onChange={(e) => handleChange('otherIncome', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestIncome" className="text-sm">
                    Interest Income
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="interestIncome"
                      type="number"
                      value={loanApplicationData.interestIncome}
                      onChange={(e) => handleChange('interestIncome', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Income</span>
                    <span className="font-medium">LKR {formatCurrency(totalIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Expenses</h4>

                <div className="space-y-2">
                  <Label htmlFor="businessExpenses" className="text-sm">
                    Business Expenses
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="businessExpenses"
                      type="number"
                      value={loanApplicationData.businessExpenses}
                      onChange={(e) => handleChange('businessExpenses', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utilityBills" className="text-sm">
                    Utility Bills
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="utilityBills"
                      type="number"
                      value={loanApplicationData.utilityBills}
                      onChange={(e) => handleChange('utilityBills', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="livingExpenses" className="text-sm">
                    Living Expenses
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="livingExpenses"
                      type="number"
                      value={loanApplicationData.livingExpenses}
                      onChange={(e) => handleChange('livingExpenses', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanPayments" className="text-sm">
                    Loan Payments
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="loanPayments"
                      type="number"
                      value={loanApplicationData.loanPayments}
                      onChange={(e) => handleChange('loanPayments', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingLoanAmount" className="text-sm">
                    Existing Loan Amount (Monthly)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="existingLoanAmount"
                      type="number"
                      value={loanApplicationData.existingLoanAmount}
                      onChange={(e) => handleChange('existingLoanAmount', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherExpenses" className="text-sm">
                    Other Expenses
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                    <Input
                      id="otherExpenses"
                      type="number"
                      value={loanApplicationData.otherExpenses}
                      onChange={(e) => handleChange('otherExpenses', e.target.value)}
                      placeholder="0.00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Expenses</span>
                    <span className="font-medium">LKR {formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">NET INCOME</span>
                <span className={cn(
                  "text-lg font-bold",
                  netIncome >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  LKR {formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button type="button" onClick={handleNext} className="flex items-center">
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderGuarantorDetails = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guarantor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guarantorName" className="text-sm font-medium">
                Guarantor Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guarantorName"
                value={loanApplicationData.guarantorName}
                onChange={(e) => handleChange('guarantorName', e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>

            <>
              <div className="space-y-2">
                <Label htmlFor="guarantorNIC" className="text-sm font-medium">
                  Guarantor ID No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guarantorNIC"
                  value={loanApplicationData.guarantorNIC}
                  onChange={(e) => handleChange('guarantorNIC', e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && (value.length < 10 || value.length > 12)) {
                      setFieldErrors(prev => ({ ...prev, guarantorNIC: 'National ID must be between 10 to 12 characters' }));
                    } else {
                      setFieldErrors(prev => ({ ...prev, guarantorNIC: '' }));
                    }
                  }}
                  placeholder="National ID"
                  required
                  maxLength={12}
                  className={fieldErrors.guarantorNIC ? "border-red-500" : ""}
                />
                {fieldErrors.guarantorNIC && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.guarantorNIC}</p>
                )}
              </div>
            </>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guarantorRelationship" className="text-sm font-medium">
                Relationship to Applicant <span className="text-red-500">*</span>
              </Label>
              <Select
                value={loanApplicationData.guarantorRelationship}
                onValueChange={(value) => {
                  handleChange('guarantorRelationship', value);
                  // Clear out otherRelationship if they chose a standard option
                  if (value !== 'Other' && loanApplicationData.otherRelationship) {
                    handleChange('otherRelationship', '');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Relative">Relative</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Colleague">Colleague</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Show text input field when "Other" is selected */}
              {loanApplicationData.guarantorRelationship === 'Other' && (
                <div className="mt-2">
                  <Input
                    id="otherRelationship"
                    value={loanApplicationData.otherRelationship || ''}
                    onChange={(e) => handleChange('otherRelationship', e.target.value)}
                    placeholder="Please specify relationship"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guarantorMobile" className="text-sm font-medium">
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guarantorMobile"
                value={loanApplicationData.guarantorMobile}
                onChange={(e) => {
                  // Only allow numeric input
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleChange('guarantorMobile', value);
                  }
                  // Clear any errors when typing
                  if (fieldErrors.guarantorMobile) {
                    setFieldErrors(prev => ({ ...prev, guarantorMobile: '' }));
                  }
                }}
                onBlur={(e) => {
                  // Validate on blur for better user experience
                  const value = e.target.value;
                  if (!value) {
                    setFieldErrors(prev => ({ ...prev, guarantorMobile: 'Mobile number is required' }));
                  } else if (value.length !== 10) {
                    setFieldErrors(prev => ({ ...prev, guarantorMobile: 'Mobile number must be 10 digits' }));
                  } else {
                    setFieldErrors(prev => ({ ...prev, guarantorMobile: '' }));
                  }
                }}
                placeholder="e.g. 0771234567"
                required
                maxLength={10}
                className={fieldErrors.guarantorMobile ? "border-red-500" : ""}
              />
              {fieldErrors.guarantorMobile && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.guarantorMobile}</p>
              )}
            </div>


          </div>

          <div className="space-y-2">
            <Label htmlFor="guarantorAddress" className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="guarantorAddress"
              value={loanApplicationData.guarantorAddress1}
              onChange={(e) => handleChange('guarantorAddress1', e.target.value)}
              placeholder="Enter full address including House No., Street, Area, Village, and City"
              required
              rows={3}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guarantorEmployment" className="text-sm font-medium">
                Employment / Business
              </Label>
              <Input
                id="guarantorEmployment"
                value={loanApplicationData.guarantorEmployment}
                onChange={(e) => handleChange('guarantorEmployment', e.target.value)}
                placeholder="Employment details"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantorIncome" className="text-sm font-medium">
                Monthly Income
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                <Input
                  id="guarantorIncome"
                  type="number"
                  value={loanApplicationData.guarantorIncome}
                  onChange={(e) => handleChange('guarantorIncome', e.target.value)}
                  placeholder="0.00"
                  className="pl-12"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={handlePrevious} variant="outline" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button type="button" onClick={handleNext} className="flex items-center">
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderSummaryView = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applicant Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold border-b pb-2">Applicant Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1 text-gray-500">Customer ID</p>
                <p className="font-medium">{loanApplicationData.customerId}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Customer Name</p>
                <p className="font-medium">{loanApplicationData.customerName}</p>
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold border-b pb-2">Loan Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1 text-gray-500">Loan Type</p>
                <p className="font-medium">{loanApplicationData.loanTypeName} ({loanApplicationData.loanType})</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Amount</p>
                <p className="font-medium">LKR {formatCurrency(loanApplicationData.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Period</p>
                <p className="font-medium">{loanApplicationData.period} {loanApplicationData.periodType}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1 text-gray-500">Rental Amount</p>
                <p className="font-medium">LKR {formatCurrency(loanApplicationData.rental)}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Nature of Business</p>
                <p className="font-medium">{loanApplicationData.natureOfBusiness}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Business Type</p>
                <p className="font-medium">{loanApplicationData.businessType}</p>
              </div>
            </div>
          </div>

          {/* Financial Status */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold border-b pb-2">Financial Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-1 text-gray-500">Total Income</p>
                <p className="font-medium">LKR {formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Total Expenses</p>
                <p className="font-medium">LKR {formatCurrency(totalExpenses)}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Net Income</p>
                <p className={cn(
                  "font-medium",
                  netIncome >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  LKR {formatCurrency(netIncome)}
                </p>
              </div>
            </div>
          </div>

          {/* Guarantor Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold border-b pb-2">Guarantor Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1 text-gray-500">Name</p>
                <p className="font-medium">{loanApplicationData.guarantorName}</p>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">ID Number</p>
                <p className="font-medium">{loanApplicationData.guarantorNIC}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1 text-gray-500">Relationship</p>
                <p className="font-medium">
                  {loanApplicationData.guarantorRelationship === 'Other'
                    ? `Other: ${loanApplicationData.otherRelationship}`
                    : loanApplicationData.guarantorRelationship}
                </p>
              </div>

              <div>
                <p className="text-sm mb-1 text-gray-500">Contact</p>
                <p className="font-medium">{loanApplicationData.guarantorMobile}</p>
              </div>
            </div>

            <div>
              <p className="text-sm mb-1 text-gray-500">Address</p>
              <p className="font-medium">
                {loanApplicationData.guarantorAddress1}
              </p>
            </div>
          </div>

          {/* Repayment Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Weekly Rental Amount</span>
              <span className="font-bold">LKR {formatCurrency(loanApplicationData.rental)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Repayment Amount</span>
              <span className="font-bold">LKR {formatCurrency(loanApplicationData.rental * loanApplicationData.period)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={handlePrevious} variant="outline" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button type="button" onClick={handleNext} className="flex items-center">
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderSubmitForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit for Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Please review the application carefully before submitting
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Once submitted, the loan application will be sent to the admin for review and approval.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              Additional Comments
            </Label>
            <Textarea
              id="comments"
              value={loanApplicationData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              placeholder="Optional: Add any additional information that might help with the approval process"
              rows={4}
            />
          </div>

          <div className="space-y-4 pt-2">
  <div className="flex items-center">
    <Checkbox
      id="agreeToTerms"
      checked={loanApplicationData.agreeToTerms}
      onCheckedChange={(checked) => handleChange('agreeToTerms', checked)}
      className="mr-4" // Add margin to the right of the checkbox
    />
    <label htmlFor="agreeToTerms" className="text-sm leading-tight">
      I confirm that all information provided is accurate and complete. I understand that providing false information may result in rejection of the application and other consequences.
    </label>
  </div>
</div>

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={handlePrevious} variant="outline" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!loanApplicationData.agreeToTerms}
            className={cn(
              "bg-green-600 hover:bg-green-700",
              !loanApplicationData.agreeToTerms && "opacity-50 cursor-not-allowed"
            )}
          >
            Submit Application
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderIncomeDetails();
      case 1:
        return renderGuarantorDetails();
      case 2:
        return renderSummaryView();
      case 3:
        return renderSubmitForm();
      default:
        return renderIncomeDetails();
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
            Complete the application form to apply for {loanApplicationData.loanTypeName}
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
}
