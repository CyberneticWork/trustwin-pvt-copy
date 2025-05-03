// components/applyforloan/PersonalDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PersonalDetailsStep({ data, onChange }) {
  console.log(data);
  // Track validation errors
  const [errors, setErrors] = useState({
    residenceType: '',
    utilityBillType: '',
  });

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.residenceType, data.utilityBillType]);

  const validateForm = () => {
    const newErrors = {
      residenceType: '',
      utilityBillType: '',
    };

    // Residence type validation
    if (!data.residenceType) {
      newErrors.residenceType = 'Residence type is required';
    }

    // Utility bill type validation
    if (!data.utilityBillType) {
      newErrors.utilityBillType = 'Utility bill type is required';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Details</h2>
      
      {/* Simple Personal Information Card */}
      <Card className="border rounded-lg shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg font-medium">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Full Name:</span>
              <span className="font-medium">{data.customerName || 'Not provided'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Client ID:</span>
              <span className="font-medium">{data.CusDisId || 'Not provided'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">NIC Number:</span>
              <span className="font-medium">{data.idNumber || 'Not provided'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
