// components/applyforloan/PersonalDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, getYear } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function PersonalDetailsStep({ data, onChange }) {
  // Track validation errors
  const [errors, setErrors] = useState({
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    location: '',
    gsDivision: '',
    dsOffice: '',
    district: '',
    province: '',
    residenceType: '',
    utilityBillType: '',
  });

  // For date picker
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Get current year and set a reasonable range
  const currentYear = new Date().getFullYear();
  const [calendarYear, setCalendarYear] = useState(currentYear - 30); // Default to 30 years ago
  
  // Initialize with date from data if available
  useEffect(() => {
    if (data.dateOfBirth) {
      setCalendarYear(getYear(new Date(data.dateOfBirth)));
    }
  }, [data.dateOfBirth]);

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.idNumber, data.dateOfBirth, data.gender, data.address, data.residenceType, data.utilityBillType]);

  const validateForm = () => {
    const newErrors = {
      idNumber: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      location: '',
      gsDivision: '',
      dsOffice: '',
      district: '',
      province: '',
      residenceType: '',
      utilityBillType: '',
    };

    // ID number validation
    if (!data.idNumber) {
      newErrors.idNumber = 'ID number is required';
    } else if (data.idNumber.length < 10 || data.idNumber.length > 12) {
      newErrors.idNumber = 'ID number must be between 10-12 characters';
    }

    // Date of Birth validation
    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Must be at least 18 years old';
      } else if (age > 100) {
        newErrors.dateOfBirth = 'Invalid date of birth';
      }
    }

    // Gender validation
    if (!data.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Address validation
    if (!data.address) {
      newErrors.address = 'Address is required';
    }

    // Location validation
    if (!data.location) {
      newErrors.location = 'Location is required';
    }

    // GS Division validation
    if (!data.gsDivision) {
      newErrors.gsDivision = 'GS Division is required';
    }

    // DS Office validation
    if (!data.dsOffice) {
      newErrors.dsOffice = 'DS Office is required';
    }

    // District validation
    if (!data.district) {
      newErrors.district = 'District is required';
    }

    // Province validation
    if (!data.province) {
      newErrors.province = 'Province is required';
    }

    // Residence type validation
    if (!data.residenceType) {
      newErrors.residenceType = 'Residence type is required';
    }

    // Utility bill type validation
    if (!data.utilityBillType) {
      newErrors.utilityBillType = 'Utility bill type is required';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors (all values in the errors object are empty strings)
    return Object.values(newErrors).every(value => value === '');
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    
    // Clear error when field is edited
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Handle utility bill type selection
  const handleUtilityBillChange = (value) => {
    handleChange('utilityBillType', value);
  };

  // Custom year navigation for calendar
  const handleYearChange = (increment) => {
    setCalendarYear(prev => prev + increment);
  };

  // Custom calendar header with year navigation
  const CustomCalendarHeader = ({
    monthLabel,
    onPreviousClick,
    onNextClick,
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
  const YearNavigation = () => {
    return (
      <div className="flex justify-between items-center px-2 py-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleYearChange(-10)}
          className="text-xs"
        >
          -10 Years
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(-1)}
            className="text-xs"
          >
            -1 Year
          </Button>
          <div className="flex items-center justify-center px-2 font-medium">
            {calendarYear}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(1)}
            className="text-xs"
            disabled={calendarYear >= currentYear - 18}
          >
            +1 Year
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleYearChange(10)}
          className="text-xs"
          disabled={calendarYear >= currentYear - 18 - 10}
        >
          +10 Years
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer name is pre-filled and not editable */}
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name</Label>
          <Input 
            id="customerName" 
            value={data.customerName} 
            disabled 
            className="bg-gray-50"
          />
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber" className="flex items-center">
            ID Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="idNumber"
            value={data.idNumber || ''}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            placeholder="National ID Number"
            className={errors.idNumber ? "border-red-500" : ""}
            maxLength={12}
          />
          {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center">
            Gender <span className="text-red-500 ml-1">*</span>
          </Label>
          <RadioGroup
            value={data.gender || ''}
            onValueChange={(value) => handleChange('gender', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="gender-male" />
              <Label htmlFor="gender-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="gender-female" />
              <Label htmlFor="gender-female">Female</Label>
            </div>
          </RadioGroup>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>

        {/* Date of Birth - Enhanced with better year navigation */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center">
            Date of Birth <span className="text-red-500 ml-1">*</span>
          </Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="dateOfBirth"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.dateOfBirth && "text-muted-foreground",
                  errors.dateOfBirth && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.dateOfBirth ? format(new Date(data.dateOfBirth), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.dateOfBirth ? new Date(data.dateOfBirth) : undefined}
                onSelect={(date) => {
                  handleChange('dateOfBirth', date ? date.toISOString() : '');
                  setIsCalendarOpen(false);
                }}
                disabled={(date) => {
                  // Disable future dates and dates that would make the person under 18
                  const minDate = new Date();
                  minDate.setFullYear(currentYear - 18);
                  return date > minDate;
                }}
                defaultMonth={new Date(calendarYear, 0, 1)}
                components={{
                  Header: CustomCalendarHeader,
                }}
              />
              <YearNavigation />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Residence Address</h3>
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center">
            Address <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="address"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter your complete address"
            rows={3}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
      </div>

      {/* Geographic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center">
            Location <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="location"
            value={data.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Location"
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gsDivision" className="flex items-center">
            GS Division <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="gsDivision"
            value={data.gsDivision || ''}
            onChange={(e) => handleChange('gsDivision', e.target.value)}
            placeholder="GS Division"
            className={errors.gsDivision ? "border-red-500" : ""}
          />
          {errors.gsDivision && <p className="text-red-500 text-xs mt-1">{errors.gsDivision}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dsOffice" className="flex items-center">
            DS Office <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="dsOffice"
            value={data.dsOffice || ''}
            onChange={(e) => handleChange('dsOffice', e.target.value)}
            placeholder="DS Office"
            className={errors.dsOffice ? "border-red-500" : ""}
          />
          {errors.dsOffice && <p className="text-red-500 text-xs mt-1">{errors.dsOffice}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district" className="flex items-center">
            District <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.district || ''}
            onValueChange={(value) => handleChange('district', value)}
          >
            <SelectTrigger id="district" className={errors.district ? "border-red-500" : ""}>
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
          {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="province" className="flex items-center">
            Province <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.province || ''}
            onValueChange={(value) => handleChange('province', value)}
          >
            <SelectTrigger id="province" className={errors.province ? "border-red-500" : ""}>
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
          {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
        </div>
      </div>

      {/* Residence & Utility Details */}
      <div className="space-y-6">
        {/* Residence Type */}
        <div className="space-y-2">
          <Label className="flex items-center">
            Residence Type <span className="text-red-500 ml-1">*</span>
          </Label>
          <RadioGroup
            value={data.residenceType || ''}
            onValueChange={(value) => handleChange('residenceType', value)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Own" id="residence-own" />
              <Label htmlFor="residence-own">Own</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Rented" id="residence-rented" />
              <Label htmlFor="residence-rented">Rented</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="With parents" id="residence-parents" />
              <Label htmlFor="residence-parents">With parents</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Spouse" id="residence-spouse" />
              <Label htmlFor="residence-spouse">Spouse</Label>
            </div>
          </RadioGroup>
          {errors.residenceType && <p className="text-red-500 text-xs mt-1">{errors.residenceType}</p>}
        </div>

        {/* Utility Bill Type - Using Checkboxes */}
        <div className="space-y-4 pt-4 border-t">
          <Label className="flex items-center">
            Utility Bill Type <span className="text-red-500 ml-1">*</span>
          </Label>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Checkbox
                id="waterBill"
                checked={data.utilityBillType === "Water Bill"}
                onCheckedChange={() => handleUtilityBillChange("Water Bill")}
                className="mr-4"
              />
              <label htmlFor="waterBill" className="text-sm leading-tight">
                Water Bill
              </label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="electricityBill"
                checked={data.utilityBillType === "Electricity Bill"}
                onCheckedChange={() => handleUtilityBillChange("Electricity Bill")}
                className="mr-4"
              />
              <label htmlFor="electricityBill" className="text-sm leading-tight">
                Electricity Bill
              </label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="telephoneBill"
                checked={data.utilityBillType === "Telephone Bill"}
                onCheckedChange={() => handleUtilityBillChange("Telephone Bill")}
                className="mr-4"
              />
              <label htmlFor="telephoneBill" className="text-sm leading-tight">
                Telephone Bill
              </label>
            </div>
            
            <div className="flex items-center">
              <Checkbox
                id="otherBill"
                checked={data.utilityBillType === "Not Given"}
                onCheckedChange={() => handleUtilityBillChange("Not Given")}
                className="mr-4"
              />
              <label htmlFor="otherBill" className="text-sm leading-tight">
                Not Given
              </label>
            </div>
          </div>
          {errors.utilityBillType && <p className="text-red-500 text-xs mt-1">{errors.utilityBillType}</p>}
        </div>
      </div>

      {/* Spouse/Relation Details */}
      <div>
        <h3 className="text-lg font-medium mb-4">Spouse/Relation Details (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="spouseName">
              Full Name
            </Label>
            <Input
              id="spouseName"
              value={data.spouseName || ''}
              onChange={(e) => handleChange('spouseName', e.target.value)}
              placeholder="Spouse/Relation full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spouseRelationship">
              Relationship
            </Label>
            <Select
              value={data.spouseRelationship || ''}
              onValueChange={(value) => handleChange('spouseRelationship', value)}
            >
              <SelectTrigger id="spouseRelationship">
                <SelectValue placeholder="Select relationship" />
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="spouseAddress">
              Address
            </Label>
            <Textarea
              id="spouseAddress"
              value={data.spouseAddress || ''}
              onChange={(e) => handleChange('spouseAddress', e.target.value)}
              placeholder="Enter spouse/relation's address"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
