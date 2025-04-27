// components/client/add-client.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import provinceDistrictData from "@/lib/jsons/srt_pro_dist.json";
import bankList from "@/lib/jsons/banklist.json";

export function AddClient({ onSubmit, onCancel, initialNIC  }) {
  // State to track the current step
  const [currentStep, setCurrentStep] = useState(0);
  // Province/district state
  const provinces = provinceDistrictData["Sri Lanka"].Provinces.map(p => p.name);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [districts, setDistricts] = useState([]);
  // State to track if all required fields are complete for each section
  const [sectionStatus, setSectionStatus] = useState({
    personal: false,
    bank: false,
    relation: false
  });

  // Validation helpers
  const validateName = (name) => /^[A-Za-z ]+$/.test(name);
  const validateIdNo = (id) => (/^\d{12}$/.test(id) || /^\d{9}[VvXx]$/.test(id));
  const validateDOB = (dob) => {
    if (!dob) return false;
    const dobDate = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - dobDate.getFullYear();
    const m = now.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dobDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };
  const validateGSDiv = (val) => /^[A-Z0-9]{3,6}$/.test(val);
  const validateDSOffice = (val) => /^[A-Za-z ]+$/.test(val);
  const validateAccountNo = (val) => /^[A-Za-z0-9]+$/.test(val);
  const validateBankBranch = (val) => /^[A-Za-z ]+$/.test(val);
  const validateRelationName = (name) => /^[A-Za-z ]+$/.test(name);
  const validateRelationAddress = (address) => address && address.length > 0;
  const validateRelationNic = (nic) => (/^\d{12}$/.test(nic) || /^\d{9}[VvXx]$/.test(nic));
  const validateRelationTelNo = (telNo) => /^[0-9]+$/.test(telNo);

  // Error state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    idNo: "",
    gender: "Male",
    dob: "",
    address1: "",
    location: "",
    gsDivision: "",
    dsOffice: "",
    district: "",
    province: "",
    utilityBillType: null,
    accountType: "Saving",
    accountNo: "",
    bankName: "",
    bankBranch: "",
    relationName: "",
    relationNic: "",
    relationTelNo: "",
    relationshipType: "Spouse",
    relationAddress1: "",
    relationAddress2: "",
    relationAddress3: ""
  });

  // Store customerId for spouse relation step
  const [customerId, setCustomerId] = useState(null);

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

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    handleChange('province', value);
    // Find districts for selected province
    const found = provinceDistrictData["Sri Lanka"].Provinces.find(p => p.name === value);
    setDistricts(found ? found.districts : []);
    // Clear district when province changes
    handleChange('district', "");
  };
  const handleDistrictChange = (value) => {
    handleChange('district', value);
  };

  // Validate if the current section has all required fields filled
  const validateSection = (step) => {
    if (step === 0) {
      const newErrors = {};
      if (!validateName(formData.fullName)) newErrors.fullName = "Name must contain only letters and spaces.";
      if (!validateIdNo(formData.idNo)) newErrors.idNo = "Invalid ID format.";
      if (!validateDOB(formData.dob)) newErrors.dob = "Must be at least 18 years old.";
      if (!formData.address1) newErrors.address1 = "Address is required.";
      if (!['JE', 'NG'].includes(formData.location)) newErrors.location = "Location must be JE or NG.";
      if (!validateGSDiv(formData.gsDivision)) newErrors.gsDivision = "GS Division: 3-6 uppercase letters/numbers.";
      if (!validateDSOffice(formData.dsOffice)) newErrors.dsOffice = "DS Office: letters only.";
      if (!formData.district) newErrors.district = "District is required.";
      if (!formData.province) newErrors.province = "Province is required.";
      if (!formData.utilityBillType) newErrors.utilityBillType = "Utility bill type required.";
      setErrors(newErrors);
      const isPersonalComplete = Object.keys(newErrors).length === 0;
      setSectionStatus(prev => ({ ...prev, personal: isPersonalComplete }));
      return isPersonalComplete;
    } 
    else if (step === 1) {
      const newErrors = {};
      if (!formData.accountType) newErrors.accountType = "Account type required.";
      if (!validateAccountNo(formData.accountNo)) newErrors.accountNo = "Account No: letters and numbers only.";
      if (!formData.bankName) newErrors.bankName = "Bank is required.";
      if (!validateBankBranch(formData.bankBranch)) newErrors.bankBranch = "Branch: letters only.";
      setErrors(newErrors);
      const isBankComplete = Object.keys(newErrors).length === 0;
      setSectionStatus(prev => ({ ...prev, bank: isBankComplete }));
      return isBankComplete;
    } 
    else if (step === 2) {
      const newErrors = {};
      if (!validateRelationName(formData.relationName)) newErrors.relationName = "Name must contain only letters and spaces.";
      if (!validateRelationNic(formData.relationNic)) newErrors.relationNic = "Invalid NIC format.";
      if (!validateRelationTelNo(formData.relationTelNo)) newErrors.relationTelNo = "Telephone No: numbers only.";
      if (!formData.relationshipType) newErrors.relationshipType = "Relationship type required.";
      if (!validateRelationAddress(formData.relationAddress1)) newErrors.relationAddress1 = "Address is required.";
      setErrors(newErrors);
      const isRelationComplete = Object.keys(newErrors).length === 0;
      setSectionStatus(prev => ({ ...prev, relation: isRelationComplete }));
      return isRelationComplete;
    }
    
    return true;
  };

  // Auto-search and fill on NIC input
  useEffect(() => {
    // Only trigger if NIC is valid
    if (validateIdNo(formData.idNo)) {
      async function fetchCustomer(nic) {
        try {
          const res = await fetch(`/api/customer/${nic}`);
          if (!res.ok) return; // Not found, do not overwrite
          const data = await res.json();
          if (data.customer) {
            // Set province/district state for dropdowns
            if (data.customer.province) setSelectedProvince(data.customer.province);
            if (data.customer.province) {
              const found = provinceDistrictData["Sri Lanka"].Provinces.find(p => p.name === data.customer.province);
              setDistricts(found ? found.districts : []);
            }
            setFormData(prev => ({
              ...prev,
              fullName: data.customer.fullname || "",
              idNo: data.customer.nic || "",
              gender: data.customer.gender === 1 ? "Male" : "Female",
              dob: data.customer.dob ? data.customer.dob.slice(0, 10) : "",
              address1: data.customer.address || "",
              location: data.customer.location || "",
              gsDivision: data.customer.gs || "",
              dsOffice: data.customer.ds || "",
              district: data.customer.district || "",
              province: data.customer.province || "",
              utilityBillType: data.customer.utiltype || null,
              accountType: data.customer.bankactype || "Saving",
              accountNo: data.customer.acno || "",
              bankName: data.customer.bank || "",
              bankBranch: data.customer.branch || "",
              // Spouse fields below
              relationName: data.spouse?.name || "",
              relationNic: data.spouse?.nic || "",
              relationTelNo: data.spouse?.telno || "",
              relationshipType: data.spouse?.relation || "Spouse",
              relationAddress1: data.spouse?.address || ""
            }));
          }
        } catch (e) {
          // Ignore errors for auto-search
        }
      }
      fetchCustomer(formData.idNo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.idNo]);

  // Auto-fill on load if NIC is provided
  useEffect(() => {
    async function fetchCustomer(nic) {
      try {
        const res = await fetch(`/api/customer/${nic}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (data.customer) {
          // Set province/district state for dropdowns
          if (data.customer.province) setSelectedProvince(data.customer.province);
          if (data.customer.province) {
            const found = provinceDistrictData["Sri Lanka"].Provinces.find(p => p.name === data.customer.province);
            setDistricts(found ? found.districts : []);
          }
          setFormData(prev => ({
            ...prev,
            fullName: data.customer.fullname || "",
            idNo: data.customer.nic || "",
            gender: data.customer.gender === 1 ? "Male" : "Female",
            dob: data.customer.dob ? data.customer.dob.slice(0, 10) : "",
            address1: data.customer.address || "",
            location: data.customer.location || "",
            gsDivision: data.customer.gs || "",
            dsOffice: data.customer.ds || "",
            district: data.customer.district || "",
            province: data.customer.province || "",
            utilityBillType: data.customer.utiltype || null,
            accountType: data.customer.bankactype || "Saving",
            accountNo: data.customer.acno || "",
            bankName: data.customer.bank || "",
            bankBranch: data.customer.branch || "",
            // Spouse fields below
            relationName: data.spouse?.name || "",
            relationNic: data.spouse?.nic || "",
            relationTelNo: data.spouse?.telno || "",
            relationshipType: data.spouse?.relation || "Spouse",
            relationAddress1: data.spouse?.address || ""
          }));
        }
      } catch (e) {
        setApiError("Failed to auto-fill client data.");
      }
    }
    if (initialNIC) fetchCustomer(initialNIC);
  }, [initialNIC]);

  // Helper to save step to API
  const saveStepToAPI = async (stepName) => {
    setApiError("");
    const customer = {
      fullname: formData.fullName,
      nic: formData.idNo,
      gender: formData.gender === "Male" ? 1 : 0,
      dob: formData.dob,
      location: formData.location,
      address: formData.address1,
      gs: formData.gsDivision,
      ds: formData.dsOffice,
      district: formData.district,
      province: formData.province,
      utiltype: formData.utilityBillType,
      bankactype: formData.accountType,
      bank: formData.bankName,
      branch: formData.bankBranch,
      acno: formData.accountNo,
      status: "draft",
      createby: "system",
      editby: "system"
    };
    // For relation step, include customerId in spouse object
    const spouse = {
      name: formData.relationName,
      nic: formData.relationNic,
      telno: formData.relationTelNo || "",
      address: formData.relationAddress1,
      relation: formData.relationshipType,
      createby: "system",
      editby: "system"
    };
    try {
      const res = await fetch("/api/customer/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, spouse, step: stepName })
      });
      const data = await res.json();
      if (!res.ok || data.code !== "SUCCESS") {
        throw new Error(data.error || "Failed to save step");
      }
      // If API returns customerId, store it for spouse step (future-proof)
      if (data.customerId) setCustomerId(data.customerId);
    } catch (e) {
      setApiError(e.message);
      return false;
    }
    return true;
  };

  // Add a function to update only status in the customer table
  const updateCustomerStatus = async (statusValue) => {
    setApiError("");
    try {
      const res = await fetch("/api/customer/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: { nic: formData.idNo, status: statusValue }, step: "status" })
      });
      const data = await res.json();
      if (!res.ok || data.code !== "SUCCESS") {
        throw new Error(data.error || "Failed to update status");
      }
      return true;
    } catch (e) {
      setApiError(e.message);
      return false;
    }
  };

  const handleNext = async () => {
    // Only proceed if current section is valid
    if (validateSection(currentStep)) {
      const ok = await saveStepToAPI(steps[currentStep]?.id);
      if (ok) setCurrentStep(current => current + 1);
    } else {
      // You could show an error message here
      alert("Please fill in all required fields before proceeding.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final validation before submission
    if (sectionStatus.personal && sectionStatus.bank && sectionStatus.relation) {
      // Only update status to 'approve' on confirm
      const ok = await updateCustomerStatus("approve");
      if (ok && onSubmit) onSubmit({ ...formData, status: "approve" });
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
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
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
              {errors.idNo && <p className="text-xs text-red-600">{errors.idNo}</p>}
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
              {errors.dob && <p className="text-xs text-red-600">{errors.dob}</p>}
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
              {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
            </div>
          </div>

          {/* Row 8-12 - Address */}
          <div className="space-y-3">
            <Label htmlFor="address1" className="text-sm font-medium">Address <span className="text-red-500">*</span></Label>
            <Input 
              id="address1" 
              value={formData.address1}
              onChange={(e) => handleChange('address1', e.target.value)}
              placeholder="House No., Street, City" 
              required
            />
            {errors.address1 && <p className="text-xs text-red-600">{errors.address1}</p>}
          </div>

          {/* Row 9-10 - GS Division and DS Office */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gsDivision" className="text-sm font-medium">GS Division <span className="text-red-500">*</span></Label>
              <Input 
                id="gsDivision" 
                value={formData.gsDivision}
                onChange={(e) => handleChange('gsDivision', e.target.value)}
                placeholder="e.g. 70B" 
                required
              />
              {errors.gsDivision && <p className="text-xs text-red-600">{errors.gsDivision}</p>}
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
              {errors.dsOffice && <p className="text-xs text-red-600">{errors.dsOffice}</p>}
            </div>
          </div>

          {/* Row 9-10 - District and Province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium">Province <span className="text-red-500">*</span></Label>
              <Select
                value={selectedProvince || formData.province}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.province && <p className="text-xs text-red-600">{errors.province}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium">District <span className="text-red-500">*</span></Label>
              <Select
                value={formData.district}
                onValueChange={handleDistrictChange}
                disabled={!selectedProvince || districts.length === 0}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && <p className="text-xs text-red-600">{errors.district}</p>}
            </div>
          </div>

          {/* Utility Bill Section */}
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
            {errors.utilityBillType && <p className="text-xs text-red-600">{errors.utilityBillType}</p>}
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

  const [bankSearch, setBankSearch] = useState("");
  const renderBankDetails = () => {
    // Filtered banks for search
    const filteredBanks = bankList.banks.filter((bank) =>
      bank.toLowerCase().includes(bankSearch.toLowerCase())
    );
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
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saving">Saving</SelectItem>
                  <SelectItem value="Current">Current</SelectItem>
                  <SelectItem value="Fixed">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
              {errors.accountType && <p className="text-xs text-red-600">{errors.accountType}</p>}
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
              {errors.accountNo && <p className="text-xs text-red-600">{errors.accountNo}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-sm font-medium">Bank <span className="text-red-500">*</span></Label>
              <Select
                value={formData.bankName}
                onValueChange={(value) => {
                  handleChange('bankName', value);
                  setBankSearch(""); // Reset search after selection
                }}
              >
                <SelectTrigger id="bankName">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {/* Search input */}
                  <div className="px-2 py-1">
                    <Input
                      autoFocus
                      placeholder="Search bank..."
                      value={bankSearch}
                      onChange={e => setBankSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-gray-400 text-xs">No banks found</div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              {errors.bankName && <p className="text-xs text-red-600">{errors.bankName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBranch" className="text-sm font-medium">Branch <span className="text-red-500">*</span></Label>
              <Input 
                id="bankBranch" 
                value={formData.bankBranch}
                onChange={(e) => handleChange('bankBranch', e.target.value)}
                placeholder="Branch Name" 
                required
              />
              {errors.bankBranch && <p className="text-xs text-red-600">{errors.bankBranch}</p>}
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
          <CardTitle>Spouse/Relation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="relationName" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
              <Input 
                id="relationName" 
                value={formData.relationName}
                onChange={(e) => handleChange('relationName', e.target.value)}
                placeholder="Full Name"
                required
              />
              {errors.relationName && <p className="text-xs text-red-600">{errors.relationName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationNic" className="text-sm font-medium">NIC <span className="text-red-500">*</span></Label>
              <Input 
                id="relationNic" 
                value={formData.relationNic}
                onChange={(e) => handleChange('relationNic', e.target.value)}
                placeholder="NIC"
                required
              />
              {errors.relationNic && <p className="text-xs text-red-600">{errors.relationNic}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationAddress1" className="text-sm font-medium">Address <span className="text-red-500">*</span></Label>
            <Input 
              id="relationAddress1" 
              value={formData.relationAddress1}
              onChange={(e) => handleChange('relationAddress1', e.target.value)}
              placeholder="Address"
              required
            />
            {errors.relationAddress1 && <p className="text-xs text-red-600">{errors.relationAddress1}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationTelNo" className="text-sm font-medium">Telephone No <span className="text-red-500">*</span></Label>
            <Input 
              id="relationTelNo" 
              value={formData.relationTelNo}
              onChange={(e) => handleChange('relationTelNo', e.target.value)}
              placeholder="Telephone No"
              required
            />
            {errors.relationTelNo && <p className="text-xs text-red-600">{errors.relationTelNo}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationshipType" className="text-sm font-medium">Relationship <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.relationshipType}
              onValueChange={(value) => handleChange('relationshipType', value)}
            >
              <SelectTrigger id="relationshipType">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.relationshipType && <p className="text-xs text-red-600">{errors.relationshipType}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={handlePrevious} variant="outline" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button type="button" onClick={handleNext}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const [showPreview, setShowPreview] = useState(false);

  const renderPreviewWindow = () => {
    return (
      <Card className="border-2 border-blue-400 shadow-lg">
        <CardHeader>
          <CardTitle>Preview Client Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Personal Details Section */}
          <div>
            <h3 className="text-base font-semibold text-blue-700 mb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Full Name:</span> {formData.fullName}</p>
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
          {/* Bank Details Section */}
          <div>
            <h3 className="text-base font-semibold text-green-700 mb-2">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Account Type:</span> {formData.accountType}</p>
                <p className="text-sm"><span className="font-medium">Account No:</span> {formData.accountNo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Bank:</span> {formData.bankName}</p>
                <p className="text-sm"><span className="font-medium">Branch:</span> {formData.bankBranch}</p>
              </div>
            </div>
          </div>
          {/* Spouse/Relation Details Section */}
          <div>
            <h3 className="text-base font-semibold text-purple-700 mb-2">Spouse/Relation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Relation Name:</span> {formData.relationName}</p>
                <p className="text-sm"><span className="font-medium">NIC:</span> {formData.relationNic}</p>
                <p className="text-sm"><span className="font-medium">Relationship:</span> {formData.relationshipType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Relation Address:</span> {formData.relationAddress1}</p>
                <p className="text-sm"><span className="font-medium">Telephone No:</span> {formData.relationTelNo}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={() => setShowPreview(false)} variant="outline">
            Edit
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
            Confirm & Save
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderCurrentStep = () => {
    if (showPreview) return renderPreviewWindow();
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
            type="button"
            disabled={!allSectionsComplete}
            className={cn(!allSectionsComplete && "opacity-50 cursor-not-allowed")}
            onClick={() => setShowPreview(true)}
          >
            Preview & Confirm
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {apiError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{apiError}</div>}
      {renderStepIndicator()}
      {renderCurrentStep()}
    </form>
  );
}
