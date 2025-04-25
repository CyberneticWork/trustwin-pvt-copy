// components/client/add-client.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function AddClient({ onSubmit, onCancel }) {
  // State to track the current step
  const [currentStep, setCurrentStep] = useState(0);
  
  // State to track if all required fields are complete for each section
  const [sectionStatus, setSectionStatus] = useState({
    personal: false,
    bank: false,
    relation: false
  });

  const [formData, setFormData] = useState({
    fullName: "",
    idNo: "",
    gender: "Male",
    dob: "",
    address1: "",
    address2: "",
    address3: "",
    location: "",
    gsDivision: "",
    dsOffice: "",
    district: "",
    province: "",
    utilityBillType: null, // Changed to store a single value
    // Bank Details
    accountType: "Saving",
    accountNo: "",
    bankName: "",
    bankBranch: "",
    // Spouse/Relation Details
    relationName: "",
    relationshipType: "Spouse",
    relationAddress1: "",
    relationAddress2: "",
    relationAddress3: ""
  });

  const steps = [
    { id: "personal", title: "Personal Details" },
    { id: "bank", title: "Bank Details" },
    { id: "relation", title: "Spouse/Relation" },
    { id: "review", title: "Review & Submit" },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check if current section is complete
    validateSection(currentStep);
  };

  // Validate if the current section has all required fields filled
  const validateSection = (step) => {
    if (step === 0) {
      // Personal details validation
      const isPersonalComplete = Boolean(
        formData.fullName && 
        formData.idNo && 
        formData.gender && 
        formData.dob && 
        formData.address1 && 
        formData.location && 
        formData.gsDivision && 
        formData.dsOffice &&
        formData.district &&
        formData.province &&
        formData.utilityBillType // Make sure a utility bill type is selected
      );
      
      setSectionStatus(prev => ({ ...prev, personal: isPersonalComplete }));
      return isPersonalComplete;
    } 
    else if (step === 1) {
      // Bank details validation
      const isBankComplete = Boolean(
        formData.accountType && 
        formData.accountNo && 
        formData.bankName && 
        formData.bankBranch
      );
      
      setSectionStatus(prev => ({ ...prev, bank: isBankComplete }));
      return isBankComplete;
    } 
    else if (step === 2) {
      // Relation details validation
      const isRelationComplete = Boolean(
        formData.relationName && 
        formData.relationshipType
      );
      
      setSectionStatus(prev => ({ ...prev, relation: isRelationComplete }));
      return isRelationComplete;
    }
    
    return true;
  };

  const handleNext = () => {
    // Only proceed if current section is valid
    if (validateSection(currentStep)) {
      setCurrentStep(current => current + 1);
    } else {
      // You could show an error message here
      alert("Please fill in all required fields before proceeding.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Final validation before submission
    if (sectionStatus.personal && sectionStatus.bank && sectionStatus.relation) {
      onSubmit(formData);
    } else {
      alert("Please complete all required fields before submitting.");
    }
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
                    "h-1 w-20 sm:w-40", 
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
                "text-xs font-medium text-center w-10 sm:w-20", 
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

  const renderPersonalDetails = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Row 6 - Customer Full Name and ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Customer Full Name <span className="text-red-500">*</span></Label>
              <Input 
                id="fullName" 
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Full Name" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNo" className="text-sm font-medium">ID No <span className="text-red-500">*</span></Label>
              <Input 
                id="idNo" 
                value={formData.idNo}
                onChange={(e) => handleChange('idNo', e.target.value)}
                placeholder="National ID" 
                required
              />
            </div>
          </div>

          {/* Row 6-7 - Gender, DOB, Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
                className="flex space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male" className="font-normal">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female" className="font-normal">Female</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input 
                  id="dob" 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="pl-9" 
                  required
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Location <span className="text-red-500">*</span></Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. JE" 
                required
              />
            </div>
          </div>

          {/* Row 8-12 - Address (multiline) and administrative divisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="address1" className="text-sm font-medium">Address <span className="text-red-500">*</span></Label>
              <Input 
                id="address1" 
                value={formData.address1}
                onChange={(e) => handleChange('address1', e.target.value)}
                placeholder="House No., Street" 
                required
              />
              <Input 
                id="address2" 
                value={formData.address2}
                onChange={(e) => handleChange('address2', e.target.value)}
                placeholder="Area, Village" 
              />
              <Input 
                id="address3" 
                value={formData.address3}
                onChange={(e) => handleChange('address3', e.target.value)}
                placeholder="City" 
              />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gsDivision" className="text-sm font-medium">GS Division <span className="text-red-500">*</span></Label>
                <Input 
                  id="gsDivision" 
                  value={formData.gsDivision}
                  onChange={(e) => handleChange('gsDivision', e.target.value)}
                  placeholder="e.g. 70B" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dsOffice" className="text-sm font-medium">DS Office <span className="text-red-500">*</span></Label>
                <Input 
                  id="dsOffice" 
                  value={formData.dsOffice}
                  onChange={(e) => handleChange('dsOffice', e.target.value)}
                  placeholder="e.g. Katana" 
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 9-10 - District and Province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium">District <span className="text-red-500">*</span></Label>
              <Input 
                id="district" 
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="e.g. Gampaha" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium">Province <span className="text-red-500">*</span></Label>
              <Input 
                id="province" 
                value={formData.province}
                onChange={(e) => handleChange('province', e.target.value)}
                placeholder="e.g. Western" 
                required
              />
            </div>
          </div>

          {/* Utility Bill Section - Added to Personal Details */}
          <div className="space-y-3 border-t pt-6">
            <Label className="text-sm font-medium">
              Utility Bill Received from Client <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="electricityBill" 
                  checked={formData.utilityBillType === "Electricity Bill"}
                  onCheckedChange={(checked) => {
                    if (checked) handleChange('utilityBillType', 'Electricity Bill');
                  }}
                />
                <Label 
                  htmlFor="electricityBill" 
                  className="font-normal"
                >
                  Electricity Bill
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="waterBill" 
                  checked={formData.utilityBillType === "Water Bill"}
                  onCheckedChange={(checked) => {
                    if (checked) handleChange('utilityBillType', 'Water Bill');
                  }}
                />
                <Label 
                  htmlFor="waterBill" 
                  className="font-normal"
                >
                  Water Bill
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="telephoneBill" 
                  checked={formData.utilityBillType === "Telephone Bill"}
                  onCheckedChange={(checked) => {
                    if (checked) handleChange('utilityBillType', 'Telephone Bill');
                  }}
                />
                <Label 
                  htmlFor="telephoneBill" 
                  className="font-normal"
                >
                  Telephone Bill
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="None" 
                  checked={formData.utilityBillType === "None"}
                  onCheckedChange={(checked) => {
                    if (checked) handleChange('utilityBillType', 'None');
                  }}
                />
                <Label 
                  htmlFor="None" 
                  className="font-normal"
                >
                  Not Given
                </Label>
              </div>

            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button type="button" onClick={handleNext} className="flex items-center">
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderBankDetails = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="accountType" className="text-sm font-medium">Account Type <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.accountType}
                onValueChange={(value) => handleChange('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saving">Saving</SelectItem>
                  <SelectItem value="Current">Current</SelectItem>
                  <SelectItem value="Fixed">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo" className="text-sm font-medium">A/C No <span className="text-red-500">*</span></Label>
              <Input 
                id="accountNo" 
                value={formData.accountNo}
                onChange={(e) => handleChange('accountNo', e.target.value)}
                placeholder="Account Number" 
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-sm font-medium">Bank <span className="text-red-500">*</span></Label>
              <Input 
                id="bankName" 
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="e.g. Commercial Bank" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBranch" className="text-sm font-medium">Branch <span className="text-red-500">*</span></Label>
              <Input 
                id="bankBranch" 
                value={formData.bankBranch}
                onChange={(e) => handleChange('bankBranch', e.target.value)}
                placeholder="e.g. Negombo" 
                required
              />
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

  const renderRelationDetails = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spouse/Relation's Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="relationName" className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
              <Input 
                id="relationName" 
                value={formData.relationName}
                onChange={(e) => handleChange('relationName', e.target.value)}
                placeholder="e.g. Mrs.Sujani Fernando" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationshipType" className="text-sm font-medium">Relationship <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.relationshipType}
                onValueChange={(value) => handleChange('relationshipType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="relationAddress1" className="text-sm font-medium">Address</Label>
              <Input 
                id="relationAddress1" 
                value={formData.relationAddress1}
                onChange={(e) => handleChange('relationAddress1', e.target.value)}
                placeholder="House No., Street" 
              />
              <Input 
                id="relationAddress2" 
                value={formData.relationAddress2}
                onChange={(e) => handleChange('relationAddress2', e.target.value)}
                placeholder="Area, Village" 
              />
              <Input 
                id="relationAddress3" 
                value={formData.relationAddress3}
                onChange={(e) => handleChange('relationAddress3', e.target.value)}
                placeholder="City" 
              />
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

  const renderReviewSection = () => {
    const allSectionsComplete = sectionStatus.personal && sectionStatus.bank && sectionStatus.relation;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review & Submit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Section Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className={cn(
                  "w-5 h-5 rounded-full mr-2", 
                  sectionStatus.personal ? "bg-green-500" : "bg-red-500"
                )}></div>
                <span>Personal Details: {sectionStatus.personal ? "Complete" : "Incomplete"}</span>
              </div>
              <div className="flex items-center">
                <div className={cn(
                  "w-5 h-5 rounded-full mr-2", 
                  sectionStatus.bank ? "bg-green-500" : "bg-red-500"
                )}></div>
                <span>Bank Details: {sectionStatus.bank ? "Complete" : "Incomplete"}</span>
              </div>
              <div className="flex items-center">
                <div className={cn(
                  "w-5 h-5 rounded-full mr-2", 
                  sectionStatus.relation ? "bg-green-500" : "bg-red-500"
                )}></div>
                <span>Spouse/Relation Details: {sectionStatus.relation ? "Complete" : "Incomplete"}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Client Information Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Name:</span> {formData.fullName}</p>
                <p className="text-sm"><span className="font-medium">ID:</span> {formData.idNo}</p>
                <p className="text-sm"><span className="font-medium">Gender:</span> {formData.gender}</p>
                <p className="text-sm"><span className="font-medium">Date of Birth:</span> {formData.dob}</p>
                <p className="text-sm"><span className="font-medium">Utility Bill:</span> {formData.utilityBillType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">District:</span> {formData.district}</p>
                <p className="text-sm"><span className="font-medium">Bank:</span> {formData.bankName}</p>
                <p className="text-sm"><span className="font-medium">Account:</span> {formData.accountNo}</p>
                <p className="text-sm"><span className="font-medium">Relation:</span> {formData.relationName} ({formData.relationshipType})</p>
              </div>
            </div>
          </div>

          {!allSectionsComplete && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <p className="text-sm text-red-800">
                Please complete all required fields in previous sections before submitting.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={handlePrevious} variant="outline" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button 
            type="submit" 
            disabled={!allSectionsComplete}
            className={cn(!allSectionsComplete && "opacity-50 cursor-not-allowed")}
          >
            Save Client
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderBankDetails();
      case 2:
        return renderRelationDetails();
      case 3:
        return renderReviewSection();
      default:
        return renderPersonalDetails();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {renderStepIndicator()}
      {renderCurrentStep()}
    </form>
  );
}
