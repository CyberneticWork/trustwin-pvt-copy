// components/applyforloan/GuarantorDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GuarantorDetailsStep({ data, onChange }) {
  const [activeTab, setActiveTab] = useState("guarantor1");
  const [isCalendarOpen, setIsCalendarOpen] = useState([false, false]);
  const [calendarYear, setCalendarYear] = useState([new Date().getFullYear() - 30, new Date().getFullYear() - 30]);
  const currentYear = new Date().getFullYear();
  
  // Track validation errors for both guarantors
  const [errors, setErrors] = useState({
    guarantors: [
      {
        name: '',
        nic: '',
        gender: '',
        dateOfBirth: '',
        relationship: '',
        address: '',
        mobile: '',
      },
      {
        name: '',
        nic: '',
        gender: '',
        dateOfBirth: '',
        relationship: '',
        address: '',
        mobile: '',
      }
    ]
  });

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.guarantors]);

  // Initialize with date from data if available
  useEffect(() => {
    if (data.guarantors[0]?.dateOfBirth) {
      setCalendarYear(prev => [new Date(data.guarantors[0].dateOfBirth).getFullYear(), prev[1]]);
    }
    if (data.guarantors[1]?.dateOfBirth) {
      setCalendarYear(prev => [prev[0], new Date(data.guarantors[1].dateOfBirth).getFullYear()]);
    }
  }, [data.guarantors[0]?.dateOfBirth, data.guarantors[1]?.dateOfBirth]);

  const validateForm = () => {
    const newErrors = {
      guarantors: [
        {
          name: '',
          nic: '',
          gender: '',
          dateOfBirth: '',
          relationship: '',
          address: '',
          mobile: '',
        },
        {
          name: '',
          nic: '',
          gender: '',
          dateOfBirth: '',
          relationship: '',
          address: '',
          mobile: '',
        }
      ]
    };

    // Validate first guarantor (required)
    if (!data.guarantors[0].name) {
      newErrors.guarantors[0].name = 'Guarantor name is required';
    }

    if (!data.guarantors[0].nic) {
      newErrors.guarantors[0].nic = 'ID number is required';
    } else if (data.guarantors[0].nic.length < 10 || data.guarantors[0].nic.length > 12) {
      newErrors.guarantors[0].nic = 'ID must be between 10-12 characters';
    }
    
    if (!data.guarantors[0].gender) {
      newErrors.guarantors[0].gender = 'Gender is required';
    }
    
    if (!data.guarantors[0].dateOfBirth) {
      newErrors.guarantors[0].dateOfBirth = 'Date of birth is required';
    }

    if (!data.guarantors[0].relationship) {
      newErrors.guarantors[0].relationship = 'Relationship is required';
    } else if (data.guarantors[0].relationship === 'Other' && !data.guarantors[0].relationshipOther) {
      newErrors.guarantors[0].relationship = 'Please specify the relationship';
    }

    if (!data.guarantors[0].address) {
      newErrors.guarantors[0].address = 'Address is required';
    }

    if (!data.guarantors[0].mobile) {
      newErrors.guarantors[0].mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(data.guarantors[0].mobile)) {
      newErrors.guarantors[0].mobile = 'Mobile must be 10 digits';
    }

    // Validate second guarantor (optional, but if any field is filled, validate all required fields)
    const hasAnyG2Field = Boolean(
      data.guarantors[1].name || 
      data.guarantors[1].nic || 
      data.guarantors[1].address ||
      data.guarantors[1].mobile
    );

    if (hasAnyG2Field) {
      if (!data.guarantors[1].name) {
        newErrors.guarantors[1].name = 'Guarantor name is required';
      }

      if (!data.guarantors[1].nic) {
        newErrors.guarantors[1].nic = 'ID number is required';
      } else if (data.guarantors[1].nic.length < 10 || data.guarantors[1].nic.length > 12) {
        newErrors.guarantors[1].nic = 'ID must be between 10-12 characters';
      }
      
      if (!data.guarantors[1].gender) {
        newErrors.guarantors[1].gender = 'Gender is required';
      }
      
      if (!data.guarantors[1].dateOfBirth) {
        newErrors.guarantors[1].dateOfBirth = 'Date of birth is required';
      }

      if (!data.guarantors[1].relationship) {
        newErrors.guarantors[1].relationship = 'Relationship is required';
      } else if (data.guarantors[1].relationship === 'Other' && !data.guarantors[1].relationshipOther) {
        newErrors.guarantors[1].relationship = 'Please specify the relationship';
      }

      if (!data.guarantors[1].address) {
        newErrors.guarantors[1].address = 'Address is required';
      }

      if (!data.guarantors[1].mobile) {
        newErrors.guarantors[1].mobile = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(data.guarantors[1].mobile)) {
        newErrors.guarantors[1].mobile = 'Mobile must be 10 digits';
      }
    }

    setErrors(newErrors);
    
    // Return true if there are no errors for guarantor 1 (and for guarantor 2 if any field is filled)
    const g1Valid = Object.values(newErrors.guarantors[0]).every(error => error === '');
    const g2Valid = !hasAnyG2Field || Object.values(newErrors.guarantors[1]).every(error => error === '');
    
    return g1Valid && g2Valid;
  };

  const handleGuarantorChange = (index, field, value) => {
    const updatedGuarantors = [...data.guarantors];
    updatedGuarantors[index] = {
      ...updatedGuarantors[index],
      [field]: value
    };
    
    onChange('guarantors', updatedGuarantors);
    
    // Clear error when field is edited
    setErrors(prev => {
      const newErrors = { ...prev };
      newErrors.guarantors[index][field] = '';
      return newErrors;
    });
  };

  const toggleCalendar = (index, isOpen) => {
    const newIsCalendarOpen = [...isCalendarOpen];
    newIsCalendarOpen[index] = isOpen;
    setIsCalendarOpen(newIsCalendarOpen);
  };

  // Custom year navigation for calendar
  const handleYearChange = (index, increment) => {
    setCalendarYear(prev => {
      const newYears = [...prev];
      newYears[index] = prev[index] + increment;
      return newYears;
    });
  };

  // Custom calendar header with year navigation
  const CustomCalendarHeader = ({
    monthLabel,
    onPreviousClick,
    onNextClick,
    guarantorIndex
  }) => {
    return (
      <div className="flex justify-between items-center px-2 py-1">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
            onClick={onPreviousClick}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-sm font-medium">
            {monthLabel}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
            onClick={onNextClick}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>
    );
  };

  // Year navigation buttons
  const YearNavigation = ({ guarantorIndex }) => {
    return (
      <div className="flex justify-between items-center px-2 py-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleYearChange(guarantorIndex, -10)}
          className="text-xs"
        >
          -10 Years
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(guarantorIndex, -1)}
            className="text-xs"
          >
            -1 Year
          </Button>
          <div className="flex items-center justify-center px-2 font-medium">
            {calendarYear[guarantorIndex]}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(guarantorIndex, 1)}
            className="text-xs"
            disabled={calendarYear[guarantorIndex] >= currentYear - 18}
          >
            +1 Year
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleYearChange(guarantorIndex, 10)}
          className="text-xs"
          disabled={calendarYear[guarantorIndex] >= currentYear - 18 - 10}
        >
          +10 Years
        </Button>
      </div>
    );
  };

  const renderGuarantorForm = (index) => {
    const guarantor = data.guarantors[index];
    const guarantorErrors = errors.guarantors[index];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guarantor Name */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}Name`} className="flex items-center">
              Full Name <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={`guarantor${index+1}Name`}
              value={guarantor.name || ''}
              onChange={(e) => handleGuarantorChange(index, 'name', e.target.value)}
              placeholder="Guarantor full name"
              className={guarantorErrors.name ? "border-red-500" : ""}
            />
            {guarantorErrors.name && <p className="text-red-500 text-xs mt-1">{guarantorErrors.name}</p>}
          </div>
          
          {/* Guarantor NIC */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}NIC`} className="flex items-center">
              ID Number <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={`guarantor${index+1}NIC`}
              value={guarantor.nic || ''}
              onChange={(e) => handleGuarantorChange(index, 'nic', e.target.value)}
              placeholder="National ID Number"
              className={guarantorErrors.nic ? "border-red-500" : ""}
              maxLength={12}
            />
            {guarantorErrors.nic && <p className="text-red-500 text-xs mt-1">{guarantorErrors.nic}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Gender <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup
              value={guarantor.gender || ''}
              onValueChange={(value) => handleGuarantorChange(index, 'gender', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id={`gender-male-${index}`} />
                <Label htmlFor={`gender-male-${index}`}>Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id={`gender-female-${index}`} />
                <Label htmlFor={`gender-female-${index}`}>Female</Label>
              </div>
            </RadioGroup>
            {guarantorErrors.gender && <p className="text-red-500 text-xs mt-1">{guarantorErrors.gender}</p>}
          </div>
          
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}DOB`} className="flex items-center">
              Date of Birth <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover 
              open={isCalendarOpen[index]} 
              onOpenChange={(isOpen) => toggleCalendar(index, isOpen)}
            >
              <PopoverTrigger asChild>
                <Button
                  id={`guarantor${index+1}DOB`}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !guarantor.dateOfBirth && "text-muted-foreground",
                    guarantorErrors.dateOfBirth && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {guarantor.dateOfBirth ? format(new Date(guarantor.dateOfBirth), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={guarantor.dateOfBirth ? new Date(guarantor.dateOfBirth) : undefined}
                  onSelect={(date) => {
                    handleGuarantorChange(index, 'dateOfBirth', date ? date.toISOString() : '');
                    toggleCalendar(index, false);
                  }}
                  disabled={(date) => {
                    // Disable future dates and dates that would make the person under 18
                    const minDate = new Date();
                    minDate.setFullYear(currentYear - 18);
                    return date > minDate;
                  }}
                  defaultMonth={new Date(calendarYear[index], 0, 1)}
                />
                <YearNavigation guarantorIndex={index} />
              </PopoverContent>
            </Popover>
            {guarantorErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{guarantorErrors.dateOfBirth}</p>}
          </div>
        </div>
        
        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor={`guarantor${index+1}Relationship`} className="flex items-center">
            Relationship to Applicant <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={guarantor.relationship || ''}
            onValueChange={(value) => {
              handleGuarantorChange(index, 'relationship', value);
              // Clear other relationship if not "Other"
              if (value !== 'Other' && guarantor.relationshipOther) {
                handleGuarantorChange(index, 'relationshipOther', '');
              }
            }}
          >
            <SelectTrigger id={`guarantor${index+1}Relationship`} className={guarantorErrors.relationship ? "border-red-500" : ""}>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Family">Family</SelectItem>
              <SelectItem value="Spouse">Spouse</SelectItem>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Child">Child</SelectItem>
              <SelectItem value="Sibling">Sibling</SelectItem>
              <SelectItem value="Relative">Relative</SelectItem>
              <SelectItem value="Friend">Friend</SelectItem>
              <SelectItem value="Colleague">Colleague</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Show text input field when "Other" is selected */}
          {guarantor.relationship === 'Other' && (
            <div className="mt-2">
              <Input
                id={`guarantor${index+1}RelationshipOther`}
                value={guarantor.relationshipOther || ''}
                onChange={(e) => handleGuarantorChange(index, 'relationshipOther', e.target.value)}
                placeholder="Please specify relationship"
                className={guarantorErrors.relationship ? "border-red-500" : ""}
              />
            </div>
          )}
          {guarantorErrors.relationship && <p className="text-red-500 text-xs mt-1">{guarantorErrors.relationship}</p>}
        </div>
        
        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor={`guarantor${index+1}Address`} className="flex items-center">
            Address <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id={`guarantor${index+1}Address`}
            value={guarantor.address || ''}
            onChange={(e) => handleGuarantorChange(index, 'address', e.target.value)}
            placeholder="Enter full address"
            className={guarantorErrors.address ? "border-red-500" : ""}
            rows={3}
          />
          {guarantorErrors.address && <p className="text-red-500 text-xs mt-1">{guarantorErrors.address}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}Location`}>
              Location
            </Label>
            <Input
              id={`guarantor${index+1}Location`}
              value={guarantor.location || ''}
              onChange={(e) => handleGuarantorChange(index, 'location', e.target.value)}
              placeholder="Location"
            />
          </div>
          
          {/* GS Division */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}GSDivision`}>
              GS Division
            </Label>
            <Input
              id={`guarantor${index+1}GSDivision`}
              value={guarantor.gsDivision || ''}
              onChange={(e) => handleGuarantorChange(index, 'gsDivision', e.target.value)}
              placeholder="GS Division"
            />
          </div>
          
          {/* DS Office */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}DSOffice`}>
              DS Office
            </Label>
            <Input
              id={`guarantor${index+1}DSOffice`}
              value={guarantor.dsOffice || ''}
              onChange={(e) => handleGuarantorChange(index, 'dsOffice', e.target.value)}
              placeholder="DS Office"
            />
          </div>
          
          {/* District */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}District`}>
              District
            </Label>
            <Select
              value={guarantor.district || ''}
              onValueChange={(value) => handleGuarantorChange(index, 'district', value)}
            >
              <SelectTrigger id={`guarantor${index+1}District`}>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ampara">Ampara</SelectItem>
                <SelectItem value="Anuradhapura">Anuradhapura</SelectItem>
                <SelectItem value="Badulla">Badulla</SelectItem>
                <SelectItem value="Batticaloa">Batticaloa</SelectItem>
                <SelectItem value="Colombo">Colombo</SelectItem>
                <SelectItem value="Galle">Galle</SelectItem>
                <SelectItem value="Gampaha">Gampaha</SelectItem>
                <SelectItem value="Hambantota">Hambantota</SelectItem>
                <SelectItem value="Jaffna">Jaffna</SelectItem>
                <SelectItem value="Kalutara">Kalutara</SelectItem>
                <SelectItem value="Kandy">Kandy</SelectItem>
                <SelectItem value="Kegalle">Kegalle</SelectItem>
                <SelectItem value="Kilinochchi">Kilinochchi</SelectItem>
                <SelectItem value="Kurunegala">Kurunegala</SelectItem>
                <SelectItem value="Mannar">Mannar</SelectItem>
                <SelectItem value="Matale">Matale</SelectItem>
                <SelectItem value="Matara">Matara</SelectItem>
                <SelectItem value="Monaragala">Monaragala</SelectItem>
                <SelectItem value="Mullaitivu">Mullaitivu</SelectItem>
                <SelectItem value="Nuwara Eliya">Nuwara Eliya</SelectItem>
                <SelectItem value="Polonnaruwa">Polonnaruwa</SelectItem>
                <SelectItem value="Puttalam">Puttalam</SelectItem>
                <SelectItem value="Ratnapura">Ratnapura</SelectItem>
                <SelectItem value="Trincomalee">Trincomalee</SelectItem>
                <SelectItem value="Vavuniya">Vavuniya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Province */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}Province`}>
              Province
            </Label>
            <Select
              value={guarantor.province || ''}
              onValueChange={(value) => handleGuarantorChange(index, 'province', value)}
            >
              <SelectTrigger id={`guarantor${index+1}Province`}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Central">Central</SelectItem>
                <SelectItem value="Eastern">Eastern</SelectItem>
                <SelectItem value="North Central">North Central</SelectItem>
                <SelectItem value="Northern">Northern</SelectItem>
                <SelectItem value="North Western">North Western</SelectItem>
                <SelectItem value="Sabaragamuwa">Sabaragamuwa</SelectItem>
                <SelectItem value="Southern">Southern</SelectItem>
                <SelectItem value="Uva">Uva</SelectItem>
                <SelectItem value="Western">Western</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}Mobile`} className="flex items-center">
              Mobile Number <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={`guarantor${index+1}Mobile`}
              value={guarantor.mobile || ''}
              onChange={(e) => {
                // Only allow numeric input
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleGuarantorChange(index, 'mobile', value);
                }
              }}
              placeholder="e.g. 0771234567"
              className={guarantorErrors.mobile ? "border-red-500" : ""}
              maxLength={10}
            />
            {guarantorErrors.mobile && <p className="text-red-500 text-xs mt-1">{guarantorErrors.mobile}</p>}
          </div>
          
          {/* Residence Type */}
          <div className="space-y-2">
            <Label htmlFor={`guarantor${index+1}ResidenceType`}>
              Residence Type
            </Label>
            <Select
              value={guarantor.residenceType || ''}
              onValueChange={(value) => handleGuarantorChange(index, 'residenceType', value)}
            >
              <SelectTrigger id={`guarantor${index+1}ResidenceType`}>
                <SelectValue placeholder="Select residence type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Own">Own</SelectItem>
                <SelectItem value="Rented">Rented</SelectItem>
                <SelectItem value="With parents">With parents</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Employment/Business & Income */}
        <div className="pt-4 border-t">
          <h3 className="text-md font-medium mb-4">Employment/Business Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`guarantor${index+1}Employment`}>
                Employment/Business
              </Label>
              <Input
                id={`guarantor${index+1}Employment`}
                value={guarantor.employment || ''}
                onChange={(e) => handleGuarantorChange(index, 'employment', e.target.value)}
                placeholder="Employment or business details"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`guarantor${index+1}Income`}>
                Monthly Income
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
                <Input
                  id={`guarantor${index+1}Income`}
                  type="number"
                  value={guarantor.income || ''}
                  onChange={(e) => handleGuarantorChange(index, 'income', e.target.value)}
                  placeholder="0.00"
                  className="pl-12"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bank Details */}
        <div className="pt-4 border-t">
          <h3 className="text-md font-medium mb-4">Bank Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`guarantor${index+1}AccountType`}>
                Account Type
              </Label>
              <Select
                value={guarantor.accountType || ''}
                onValueChange={(value) => handleGuarantorChange(index, 'accountType', value)}
              >
                <SelectTrigger id={`guarantor${index+1}AccountType`}>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Current">Current</SelectItem>
                  <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`guarantor${index+1}AccountNumber`}>
                Account Number
              </Label>
              <Input
                id={`guarantor${index+1}AccountNumber`}
                value={guarantor.accountNumber || ''}
                onChange={(e) => handleGuarantorChange(index, 'accountNumber', e.target.value)}
                placeholder="Account number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`guarantor${index+1}BankName`}>
                Bank Name
              </Label>
              <Select
                value={guarantor.bankName || ''}
                onValueChange={(value) => handleGuarantorChange(index, 'bankName', value)}
              >
                <SelectTrigger id={`guarantor${index+1}BankName`}>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank of Ceylon">Bank of Ceylon</SelectItem>
                  <SelectItem value="People's Bank">People's Bank</SelectItem>
                  <SelectItem value="Commercial Bank">Commercial Bank</SelectItem>
                  <SelectItem value="Hatton National Bank">Hatton National Bank</SelectItem>
                  <SelectItem value="Sampath Bank">Sampath Bank</SelectItem>
                  <SelectItem value="Nations Trust Bank">Nations Trust Bank</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Guarantor Details</h2>
      
      <Tabs defaultValue="guarantor1" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="guarantor1">Guarantor I <span className="text-red-500 ml-1">*</span></TabsTrigger>
          <TabsTrigger value="guarantor2">Guarantor II</TabsTrigger>
        </TabsList>
        <TabsContent value="guarantor1" className="pt-4">
          {renderGuarantorForm(0)}
        </TabsContent>
        <TabsContent value="guarantor2" className="pt-4">
          <div className="bg-yellow-50 p-3 rounded-md mb-4 border border-yellow-200">
            <p className="text-sm text-yellow-800">Second guarantor is optional but recommended for higher loan amounts.</p>
          </div>
          {renderGuarantorForm(1)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
