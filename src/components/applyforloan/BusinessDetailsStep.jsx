// components/applyforloan/BusinessDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BusinessDetailsStep({ data, onChange }) {
  // Track validation errors
  const [errors, setErrors] = useState({
    natureOfBusiness: '',
    businessPeriod: '',
    businessName: '',
    businessRegistrationNo: '',
    businessType: '',
    businessAddress: '',
  });

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [
    data.natureOfBusiness,
    data.businessName,
    data.businessPeriod,
    data.businessRegistrationNo,
    data.businessType,
    data.businessAddress
  ]);

  const validateForm = () => {
    const newErrors = {
      natureOfBusiness: '',
      businessPeriod: '',
      businessName: '',
      businessRegistrationNo: '',
      businessType: '',
      businessAddress: '',
    };

    // Nature of Business validation
    if (!data.natureOfBusiness) {
      newErrors.natureOfBusiness = 'Nature of business is required';
    }

    // Business Period validation
    if (data.businessPeriod && (isNaN(data.businessPeriod) || Number(data.businessPeriod) <= 0)) {
      newErrors.businessPeriod = 'Business period must be a positive number';
    }

    // Business Type validation
    if (!data.businessType) {
      newErrors.businessType = 'Business type is required';
    }

    // Business Name is optional, but validate if provided
    if (data.businessName && data.businessName.length < 2) {
      newErrors.businessName = 'Business name should be at least 2 characters';
    }

    // Business Registration Number is optional, no specific validation

    // Business Address validation
    if (!data.businessAddress) {
      newErrors.businessAddress = 'Business address is required';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return Object.values(newErrors).every(error => error === '');
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    
    // Clear error when field is edited
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    try {
      // Update the local state to show the image was uploaded
      const updatedImages = [...(data.businessImages || [])];
      updatedImages[index] = file;
      onChange('businessImages', updatedImages);
    } catch (error) {
      console.error("Error updating image state:", error);
      alert(error.message || "Failed to update image. Please try again.");
    }
  };
  
  const handleImageRemove = (index) => {
    const updatedImages = [...(data.businessImages || [])];
    updatedImages[index] = null;
    
    onChange('businessImages', updatedImages);
  };

  // Handle form submission when clicking next
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create form data with loanId
      const formData = new FormData();
      formData.append('loanId', data.loanid);

      // Add all images that are selected
      for (let i = 0; i < 3; i++) {
        if (data.businessImages?.[i]) {
          formData.append(`image${i + 1}`, data.businessImages[i]);
        }
      }

      // Send to the upload API
      const response = await fetch('/api/loan/business/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.code === "SUCCESS") {
        // Form submission successful, you can navigate to next step here
        console.log("Business details submitted successfully");
      } else {
        throw new Error(result.message || "Failed to submit business details");
      }
    } catch (error) {
      console.error("Error submitting business details:", error);
      alert(error.message || "Failed to submit business details. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Business Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nature of Business */}
        <div className="space-y-2">
          <Label htmlFor="natureOfBusiness" className="flex items-center">
            Nature of Business <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="natureOfBusiness"
            value={data.natureOfBusiness || ''}
            onChange={(e) => handleChange('natureOfBusiness', e.target.value)}
            placeholder="e.g. Retail, Manufacturing, Services"
            className={errors.natureOfBusiness ? "border-red-500" : ""}
          />
          {errors.natureOfBusiness && <p className="text-red-500 text-xs mt-1">{errors.natureOfBusiness}</p>}
        </div>
        
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName">
            Business Name
          </Label>
          <Input
            id="businessName"
            value={data.businessName || ''}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="Enter business name"
            className={errors.businessName ? "border-red-500" : ""}
          />
          {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
        </div>

        {/* Business Registration Number */}
        <div className="space-y-2">
          <Label htmlFor="businessRegistrationNo">
            Registration Number
          </Label>
          <Input
            id="businessRegistrationNo"
            value={data.businessRegistrationNo || ''}
            onChange={(e) => handleChange('businessRegistrationNo', e.target.value)}
            placeholder="Business registration number"
            className={errors.businessRegistrationNo ? "border-red-500" : ""}
          />
          {errors.businessRegistrationNo && <p className="text-red-500 text-xs mt-1">{errors.businessRegistrationNo}</p>}
        </div>
        
        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType" className="flex items-center">
            Type of Business <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.businessType || ''}
            onValueChange={(value) => handleChange('businessType', value)}
          >
            <SelectTrigger id="businessType" className={errors.businessType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Proprietorship">Proprietorship</SelectItem>
              <SelectItem value="Partnership">Partnership</SelectItem>
              <SelectItem value="Corporation">Corporation</SelectItem>
              <SelectItem value="Limited Liability Company">Limited Liability Company</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
        </div>
        
        {/* Business Period */}
        <div className="space-y-2">
          <Label htmlFor="businessPeriod">
            Period of Business (months)
          </Label>
          <Input
            id="businessPeriod"
            type="number"
            value={data.businessPeriod || ''}
            onChange={(e) => handleChange('businessPeriod', e.target.value)}
            placeholder="e.g. 36"
            className={errors.businessPeriod ? "border-red-500" : ""}
            min="1"
          />
          {errors.businessPeriod && <p className="text-red-500 text-xs mt-1">{errors.businessPeriod}</p>}
        </div>
      </div>
      
      {/* Business Address */}
      <div className="space-y-2">
        <Label htmlFor="businessAddress" className="flex items-center">
          Business Address <span className="text-red-500 ml-1">*</span>
        </Label>
        <Textarea
          id="businessAddress"
          value={data.businessAddress || ''}
          onChange={(e) => handleChange('businessAddress', e.target.value)}
          placeholder="Enter full business address"
          className={errors.businessAddress ? "border-red-500" : ""}
          rows={3}
        />
        {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
      </div>

      {/* Upload Business Images */}
      <div className="space-y-3">
        <Label className="block text-sm font-medium">
          Upload Business Images
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Business Image 1 */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
            {data.businessImages?.[0] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={typeof data.businessImages[0] === 'string' 
                      ? data.businessImages[0] 
                      : URL.createObjectURL(data.businessImages[0])
                    } 
                    alt="Business" 
                    className="h-32 mx-auto object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleImageRemove(0)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {typeof data.businessImages[0] !== 'string' && 
                    `${data.businessImages[0].name.substring(0, 20)}${data.businessImages[0].name.length > 20 ? '...' : ''}`
                  }
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="businessImage1"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(0, e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Business Image 1</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                </div>
              </>
            )}
          </div>
          
          {/* Business Image 2 */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
            {data.businessImages?.[1] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={typeof data.businessImages[1] === 'string' 
                      ? data.businessImages[1] 
                      : URL.createObjectURL(data.businessImages[1])
                    } 
                    alt="Business" 
                    className="h-32 mx-auto object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleImageRemove(1)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {typeof data.businessImages[1] !== 'string' && 
                    `${data.businessImages[1].name.substring(0, 20)}${data.businessImages[1].name.length > 20 ? '...' : ''}`
                  }
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="businessImage2"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(1, e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Business Image 2</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                </div>
              </>
            )}
          </div>
          
          {/* Business Image 3 */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
            {data.businessImages?.[2] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={typeof data.businessImages[2] === 'string' 
                      ? data.businessImages[2] 
                      : URL.createObjectURL(data.businessImages[2])
                    } 
                    alt="Business" 
                    className="h-32 mx-auto object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleImageRemove(2)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {typeof data.businessImages[2] !== 'string' && 
                    `${data.businessImages[2].name.substring(0, 20)}${data.businessImages[2].name.length > 20 ? '...' : ''}`
                  }
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="businessImage3"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(2, e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Business Image 3</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Upload clear photos of your business premises from different angles.
        </p>
      </div>
    </div>
  );
}
