// components/applyforloan/VehicleDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VehicleDetailsStep({ data, onChange, onNestedChange }) {
  const [errors, setErrors] = useState({
    vehicle: {
      type: '',
      make: '',
      model: '',
      vehicleNo: '',
      chassisNo: '',
      engineNo: '',
      firstRegDate: '',
      engineCapacity: '',
      meterReading: '',
      valuationAmount: '',
      valuerName: '',
      documents: {
        valuation: '',
        crBook: '',
      }
    }
  });

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.vehicle]);

  const validateForm = () => {
    const newErrors = {
      vehicle: {
        type: '',
        make: '',
        model: '',
        vehicleNo: '',
        chassisNo: '',
        engineNo: '',
        firstRegDate: '',
        engineCapacity: '',
        meterReading: '',
        valuationAmount: '',
        valuerName: '',
        documents: {
          valuation: '',
          crBook: '',
        }
      }
    };

    // Vehicle Type validation
    if (!data.vehicle?.type) {
      newErrors.vehicle.type = 'Vehicle type is required';
    }

    // Make validation
    if (!data.vehicle?.make) {
      newErrors.vehicle.make = 'Make is required';
    }

    // Model validation
    if (!data.vehicle?.model) {
      newErrors.vehicle.model = 'Model is required';
    }

    // Vehicle No validation
    if (!data.vehicle?.vehicleNo) {
      newErrors.vehicle.vehicleNo = 'Vehicle number is required';
    } else if (!/^[A-Za-z]{1,3}-\d{1,4}$/.test(data.vehicle?.vehicleNo)) {
      newErrors.vehicle.vehicleNo = 'Format: ABC-1234';
    }

    // Chassis No validation
    if (!data.vehicle?.chassisNo) {
      newErrors.vehicle.chassisNo = 'Chassis number is required';
    }

    // Engine No validation
    if (!data.vehicle?.engineNo) {
      newErrors.vehicle.engineNo = 'Engine number is required';
    }

    // First Registration Date validation
    if (!data.vehicle?.firstRegDate) {
      newErrors.vehicle.firstRegDate = 'Registration date is required';
    }

    // Engine Capacity validation
    if (!data.vehicle?.engineCapacity) {
      newErrors.vehicle.engineCapacity = 'Engine capacity is required';
    } else if (isNaN(data.vehicle.engineCapacity) || parseFloat(data.vehicle.engineCapacity) <= 0) {
      newErrors.vehicle.engineCapacity = 'Enter a valid number';
    }

    // Meter Reading validation
    if (!data.vehicle?.meterReading) {
      newErrors.vehicle.meterReading = 'Meter reading is required';
    } else if (isNaN(data.vehicle.meterReading) || parseInt(data.vehicle.meterReading) < 0) {
      newErrors.vehicle.meterReading = 'Enter a valid number';
    }

    // Valuation Amount validation
    if (!data.vehicle?.valuationAmount) {
      newErrors.vehicle.valuationAmount = 'Valuation amount is required';
    } else if (isNaN(data.vehicle.valuationAmount) || parseFloat(data.vehicle.valuationAmount) <= 0) {
      newErrors.vehicle.valuationAmount = 'Enter a valid amount';
    }

    // Valuer Name validation
    if (!data.vehicle?.valuerName) {
      newErrors.vehicle.valuerName = 'Valuer name is required';
    }

    // Document validation
    if (!data.vehicle?.documents?.valuation) {
      newErrors.vehicle.documents.valuation = 'Valuation document is required';
    }

    if (!data.vehicle?.documents?.crBook) {
      newErrors.vehicle.documents.crBook = 'CR Book is required';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return !Object.values(newErrors.vehicle).some(value => 
      typeof value === 'object' 
        ? Object.values(value).some(v => v !== '')
        : value !== ''
    );
  };

  const handleNestedChange = (field, value) => {
    onNestedChange('vehicle', field, value);
    
    // Clear error when field is edited
    setErrors(prev => {
      const newErrors = { ...prev };
      newErrors.vehicle[field] = '';
      return newErrors;
    });
  };

  const handleDocumentChange = (field, file) => {
    const updatedDocuments = {
      ...data.vehicle?.documents,
      [field]: file
    };
    
    onNestedChange('vehicle', 'documents', updatedDocuments);
    
    // Clear error when field is edited
    setErrors(prev => {
      const newErrors = { ...prev };
      newErrors.vehicle.documents[field] = '';
      return newErrors;
    });
  };

  const handleVehicleImageUpload = (index, file) => {
    if (!file) return;
    
    // Clone the current images array
    const updatedImages = [...(data.vehicle?.documents?.vehicleImages || [])];
    updatedImages[index] = file;
    
    const updatedDocuments = {
      ...data.vehicle?.documents,
      vehicleImages: updatedImages
    };
    
    onNestedChange('vehicle', 'documents', updatedDocuments);
  };

  const handleVehicleImageRemove = (index) => {
    const updatedImages = [...(data.vehicle?.documents?.vehicleImages || [])];
    updatedImages[index] = null;
    
    const updatedDocuments = {
      ...data.vehicle?.documents,
      vehicleImages: updatedImages
    };
    
    onNestedChange('vehicle', 'documents', updatedDocuments);
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Vehicle Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicleType" className="flex items-center">
            Vehicle Type <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.vehicle?.type || ''}
            onValueChange={(value) => handleNestedChange('type', value)}
          >
            <SelectTrigger id="vehicleType" className={errors.vehicle.type ? "border-red-500" : ""}>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Motorcycle">Motorcycle</SelectItem>
              <SelectItem value="Three Wheeler">Three Wheeler</SelectItem>
              <SelectItem value="Car">Car</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Bus">Bus</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicle.type && <p className="text-red-500 text-xs mt-1">{errors.vehicle.type}</p>}
        </div>

        {/* Make */}
        <div className="space-y-2">
          <Label htmlFor="vehicleMake" className="flex items-center">
            Make <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={data.vehicle?.make || ''}
            onValueChange={(value) => handleNestedChange('make', value)}
          >
            <SelectTrigger id="vehicleMake" className={errors.vehicle.make ? "border-red-500" : ""}>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Toyota">Toyota</SelectItem>
              <SelectItem value="Honda">Honda</SelectItem>
              <SelectItem value="Suzuki">Suzuki</SelectItem>
              <SelectItem value="Nissan">Nissan</SelectItem>
              <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
              <SelectItem value="Bajaj">Bajaj</SelectItem>
              <SelectItem value="TVS">TVS</SelectItem>
              <SelectItem value="Hero">Hero</SelectItem>
              <SelectItem value="Yamaha">Yamaha</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicle.make && <p className="text-red-500 text-xs mt-1">{errors.vehicle.make}</p>}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="vehicleModel" className="flex items-center">
            Model <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="vehicleModel"
            value={data.vehicle?.model || ''}
            onChange={(e) => handleNestedChange('model', e.target.value)}
            placeholder="e.g. Corolla, Civic, Pulsar"
            className={errors.vehicle.model ? "border-red-500" : ""}
          />
          {errors.vehicle.model && <p className="text-red-500 text-xs mt-1">{errors.vehicle.model}</p>}
        </div>

        {/* Vehicle No */}
        <div className="space-y-2">
          <Label htmlFor="vehicleNo" className="flex items-center">
            Vehicle Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="vehicleNo"
            value={data.vehicle?.vehicleNo || ''}
            onChange={(e) => handleNestedChange('vehicleNo', e.target.value.toUpperCase())}
            placeholder="e.g. ABC-1234"
            className={errors.vehicle.vehicleNo ? "border-red-500" : ""}
          />
          {errors.vehicle.vehicleNo && <p className="text-red-500 text-xs mt-1">{errors.vehicle.vehicleNo}</p>}
        </div>

        {/* Chassis No */}
        <div className="space-y-2">
          <Label htmlFor="chassisNo" className="flex items-center">
            Chassis Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="chassisNo"
            value={data.vehicle?.chassisNo || ''}
            onChange={(e) => handleNestedChange('chassisNo', e.target.value.toUpperCase())}
            placeholder="Enter chassis number"
            className={errors.vehicle.chassisNo ? "border-red-500" : ""}
          />
          {errors.vehicle.chassisNo && <p className="text-red-500 text-xs mt-1">{errors.vehicle.chassisNo}</p>}
        </div>

        {/* Engine No */}
        <div className="space-y-2">
          <Label htmlFor="engineNo" className="flex items-center">
            Engine Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="engineNo"
            value={data.vehicle?.engineNo || ''}
            onChange={(e) => handleNestedChange('engineNo', e.target.value.toUpperCase())}
            placeholder="Enter engine number"
            className={errors.vehicle.engineNo ? "border-red-500" : ""}
          />
          {errors.vehicle.engineNo && <p className="text-red-500 text-xs mt-1">{errors.vehicle.engineNo}</p>}
        </div>

        {/* First Registration Date */}
        <div className="space-y-2">
          <Label htmlFor="firstRegDate" className="flex items-center">
            First Registration Date <span className="text-red-500 ml-1">*</span>
          </Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.vehicle?.firstRegDate && "text-muted-foreground",
                  errors.vehicle.firstRegDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.vehicle?.firstRegDate ? format(new Date(data.vehicle.firstRegDate), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.vehicle?.firstRegDate ? new Date(data.vehicle.firstRegDate) : undefined}
                onSelect={(date) => {
                  handleNestedChange('firstRegDate', date ? date.toISOString() : '');
                  setIsCalendarOpen(false);
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.vehicle.firstRegDate && <p className="text-red-500 text-xs mt-1">{errors.vehicle.firstRegDate}</p>}
        </div>

        {/* Engine Capacity */}
        <div className="space-y-2">
          <Label htmlFor="engineCapacity" className="flex items-center">
            Engine Capacity (cc) <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="engineCapacity"
            type="number"
            value={data.vehicle?.engineCapacity || ''}
            onChange={(e) => handleNestedChange('engineCapacity', e.target.value)}
            placeholder="e.g. 1500"
            className={errors.vehicle.engineCapacity ? "border-red-500" : ""}
          />
          {errors.vehicle.engineCapacity && <p className="text-red-500 text-xs mt-1">{errors.vehicle.engineCapacity}</p>}
        </div>

        {/* Meter Reading */}
        <div className="space-y-2">
          <Label htmlFor="meterReading" className="flex items-center">
            Meter Reading (km) <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="meterReading"
            type="number"
            value={data.vehicle?.meterReading || ''}
            onChange={(e) => handleNestedChange('meterReading', e.target.value)}
            placeholder="e.g. 45000"
            className={errors.vehicle.meterReading ? "border-red-500" : ""}
          />
          {errors.vehicle.meterReading && <p className="text-red-500 text-xs mt-1">{errors.vehicle.meterReading}</p>}
        </div>
      </div>

      {/* Valuation Section */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Valuation Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Valuer's Name */}
          <div className="space-y-2">
            <Label htmlFor="valuerName" className="flex items-center">
              Valuer's Name <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="valuerName"
              value={data.vehicle?.valuerName || ''}
              onChange={(e) => handleNestedChange('valuerName', e.target.value)}
              placeholder="Enter valuer's name"
              className={errors.vehicle.valuerName ? "border-red-500" : ""}
            />
            {errors.vehicle.valuerName && <p className="text-red-500 text-xs mt-1">{errors.vehicle.valuerName}</p>}
          </div>

          {/* Valuation Amount */}
          <div className="space-y-2">
            <Label htmlFor="valuationAmount" className="flex items-center">
              Valuation Amount <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="valuationAmount"
                type="number"
                value={data.vehicle?.valuationAmount || ''}
                onChange={(e) => handleNestedChange('valuationAmount', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.vehicle.valuationAmount ? "border-red-500" : ""}`}
              />
            </div>
            {errors.vehicle.valuationAmount && <p className="text-red-500 text-xs mt-1">{errors.vehicle.valuationAmount}</p>}
          </div>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Required Documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Valuation Document */}
          <div className="space-y-2">
            <Label className="flex items-center">
              Valuation Document <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
              {data.vehicle?.documents?.valuation ? (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="h-32 flex items-center justify-center bg-slate-100 rounded">
                      {data.vehicle.documents.valuation.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(data.vehicle.documents.valuation)} 
                          alt="Valuation" 
                          className="h-full object-contain rounded"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm mt-1">{data.vehicle.documents.valuation.name.split('.').pop().toUpperCase()} Document</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                      onClick={() => handleDocumentChange('valuation', null)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {data.vehicle.documents.valuation.name.substring(0, 20)}
                    {data.vehicle.documents.valuation.name.length > 20 ? '...' : ''}
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="valuationDocument"
                    accept="image/*,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleDocumentChange('valuation', e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Upload Valuation</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG</p>
                  </div>
                </>
              )}
            </div>
            {errors.vehicle.documents?.valuation && (
              <p className="text-red-500 text-xs mt-1">{errors.vehicle.documents.valuation}</p>
            )}
          </div>

          {/* CR Book */}
          <div className="space-y-2">
            <Label className="flex items-center">
              CR Book <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
              {data.vehicle?.documents?.crBook ? (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="h-32 flex items-center justify-center bg-slate-100 rounded">
                      {data.vehicle.documents.crBook.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(data.vehicle.documents.crBook)} 
                          alt="CR Book" 
                          className="h-full object-contain rounded"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm mt-1">{data.vehicle.documents.crBook.name.split('.').pop().toUpperCase()} Document</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                      onClick={() => handleDocumentChange('crBook', null)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {data.vehicle.documents.crBook.name.substring(0, 20)}
                    {data.vehicle.documents.crBook.name.length > 20 ? '...' : ''}
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="crBookDocument"
                    accept="image/*,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleDocumentChange('crBook', e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Upload CR Book</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG</p>
                  </div>
                </>
              )}
            </div>
            {errors.vehicle.documents?.crBook && (
              <p className="text-red-500 text-xs mt-1">{errors.vehicle.documents.crBook}</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Images */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Vehicle Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vehicle Image 1 */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
            {data.vehicle?.documents?.vehicleImages?.[0] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={typeof data.vehicle.documents.vehicleImages[0] === 'string' 
                      ? data.vehicle.documents.vehicleImages[0] 
                      : URL.createObjectURL(data.vehicle.documents.vehicleImages[0])
                    } 
                    alt="Vehicle" 
                    className="h-32 mx-auto object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleVehicleImageRemove(0)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {typeof data.vehicle.documents.vehicleImages[0] !== 'string' && 
                    `${data.vehicle.documents.vehicleImages[0].name.substring(0, 20)}${data.vehicle.documents.vehicleImages[0].name.length > 20 ? '...' : ''}`
                  }
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="vehicleImage1"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVehicleImageUpload(0, e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Front View</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                </div>
              </>
            )}
          </div>
          
          {/* Vehicle Image 2 */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
            {data.vehicle?.documents?.vehicleImages?.[1] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={typeof data.vehicle.documents.vehicleImages[1] === 'string' 
                      ? data.vehicle.documents.vehicleImages[1] 
                      : URL.createObjectURL(data.vehicle.documents.vehicleImages[1])
                    } 
                    alt="Vehicle" 
                    className="h-32 mx-auto object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleVehicleImageRemove(1)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {typeof data.vehicle.documents.vehicleImages[1] !== 'string' && 
                    `${data.vehicle.documents.vehicleImages[1].name.substring(0, 20)}${data.vehicle.documents.vehicleImages[1].name.length > 20 ? '...' : ''}`
                  }
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="vehicleImage2"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVehicleImageUpload(1, e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Side View</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                </div>
              </>
            )}
          </div>
          
          {/* Vehicle Image 3 */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative">
            {data.vehicle?.documents?.vehicleImages?.[2] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={typeof data.vehicle.documents.vehicleImages[2] === 'string' 
                      ? data.vehicle.documents.vehicleImages[2] 
                      : URL.createObjectURL(data.vehicle.documents.vehicleImages[2])
                    } 
                    alt="Vehicle" 
                    className="h-32 mx-auto object-cover rounded"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleVehicleImageRemove(2)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {typeof data.vehicle.documents.vehicleImages[2] !== 'string' && 
                    `${data.vehicle.documents.vehicleImages[2].name.substring(0, 20)}${data.vehicle.documents.vehicleImages[2].name.length > 20 ? '...' : ''}`
                  }
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="vehicleImage3"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVehicleImageUpload(2, e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Back View</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Apply Loan Based on Valuation */}
      {data.vehicle?.valuationAmount && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Valuation Amount</span>
            <span className="font-bold">LKR {formatCurrency(data.vehicle.valuationAmount)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Maximum Loan (70% of valuation)</span>
            <span className="font-bold text-blue-700">
              LKR {formatCurrency(parseFloat(data.vehicle.valuationAmount) * 0.7)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Note: The loan amount is typically limited to 70% of the vehicle's valuation amount.
            The final loan amount will be determined by the loan officer based on your financial assessment.
          </p>
        </div>
      )}
    </div>
  );
}
