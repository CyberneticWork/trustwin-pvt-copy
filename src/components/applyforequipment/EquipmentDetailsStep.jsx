// components/applyforequipment/EquipmentDetailsStep.jsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Camera, File } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EquipmentDetailsStep({ data, onChange, onNestedChange }) {
  const [errors, setErrors] = useState({
    make: "",
    model: "",
    serialNumber: "",
    imeiNumber: "",
    devicePrice: "",
    downPayment: "",
  });

  const [previews, setPreviews] = useState({
    invoice: null,
    deviceImages: []
  });

  // Initialize previews from existing data
  useState(() => {
    const newPreviews = {
      invoice: null,
      deviceImages: []
    };

    // Handle invoice
    if (data.equipment?.documents?.invoice) {
      if (typeof data.equipment.documents.invoice === 'object' && 'type' in data.equipment.documents.invoice) {
        newPreviews.invoice = URL.createObjectURL(data.equipment.documents.invoice);
      } else if (typeof data.equipment.documents.invoice === "string") {
        newPreviews.invoice = data.equipment.documents.invoice;
      }
    }

    // Handle device images
    if (data.equipment?.documents?.deviceImages && Array.isArray(data.equipment.documents.deviceImages)) {
      newPreviews.deviceImages = data.equipment.documents.deviceImages.map(img => {
        if (typeof img === 'object' && img?.type) {
          return URL.createObjectURL(img);
        }
        return img; // If it's already a URL
      });
    }

    setPreviews(newPreviews);

    // Cleanup function
    return () => {
      if (newPreviews.invoice && typeof newPreviews.invoice === 'string' && newPreviews.invoice.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.invoice);
      }
      
      newPreviews.deviceImages.forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleInvoiceUpload = (e) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    // Update data state
    onNestedChange("equipment", "documents", {
      ...data.equipment?.documents,
      invoice: file
    });

    // Create preview
    if (previews.invoice && typeof previews.invoice === 'string' && previews.invoice.startsWith('blob:')) {
      URL.revokeObjectURL(previews.invoice);
    }
    
    setPreviews(prev => ({
      ...prev,
      invoice: URL.createObjectURL(file)
    }));

    validateField("invoice", file);
  };

  const handleInvoiceRemove = () => {
    // Update data state
    onNestedChange("equipment", "documents", {
      ...data.equipment?.documents,
      invoice: null
    });

    // Clear preview
    if (previews.invoice && typeof previews.invoice === 'string' && previews.invoice.startsWith('blob:')) {
      URL.revokeObjectURL(previews.invoice);
    }
    
    setPreviews(prev => ({
      ...prev,
      invoice: null
    }));
  };

  const handleDeviceImageUpload = (e) => {
    if (!e.target.files?.length) return;

    const fileArray = Array.from(e.target.files);
    
    // Update data state
    const updatedDeviceImages = data.equipment?.documents?.deviceImages 
      ? [...data.equipment.documents.deviceImages] 
      : [];
    
    fileArray.forEach(file => {
      updatedDeviceImages.push(file);
    });
    
    // Limit to max 4 images
    const limitedImages = updatedDeviceImages.slice(0, 4);
    
    onNestedChange("equipment", "documents", {
      ...data.equipment?.documents,
      deviceImages: limitedImages
    });

    // Create previews
    const newPreviews = [...previews.deviceImages];
    fileArray.forEach(file => {
      newPreviews.push(URL.createObjectURL(file));
    });
    
    // Limit to max 4 previews
    const limitedPreviews = newPreviews.slice(0, 4);
    
    setPreviews(prev => ({
      ...prev,
      deviceImages: limitedPreviews
    }));
  };

  const handleDeviceImageRemove = (index) => {
    // Update data state
    const updatedDeviceImages = data.equipment?.documents?.deviceImages 
      ? [...data.equipment.documents.deviceImages] 
      : [];
    
    updatedDeviceImages.splice(index, 1);
    
    onNestedChange("equipment", "documents", {
      ...data.equipment?.documents,
      deviceImages: updatedDeviceImages
    });

    // Update preview
    const updatedPreviews = [...previews.deviceImages];
    
    // Revoke URL to prevent memory leaks
    if (typeof updatedPreviews[index] === 'string' && updatedPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(updatedPreviews[index]);
    }
    
    updatedPreviews.splice(index, 1);
    
    setPreviews(prev => ({
      ...prev,
      deviceImages: updatedPreviews
    }));
  };

  const calculateLoanAmount = () => {
    const devicePrice = parseFloat(data.equipment?.devicePrice) || 0;
    const downPayment = parseFloat(data.equipment?.downPayment) || 0;
    return devicePrice - downPayment;
  };

  const handleDevicePriceChange = (e) => {
    const devicePrice = e.target.value;
    onNestedChange("equipment", "devicePrice", devicePrice);
    
    // Calculate and update loan amount
    const downPayment = parseFloat(data.equipment?.downPayment) || 0;
    const loanAmount = parseFloat(devicePrice) - downPayment;
    onChange("loanAmount", loanAmount.toString());
    
    validateField("devicePrice", devicePrice);
  };

  const handleDownPaymentChange = (e) => {
    const downPayment = e.target.value;
    onNestedChange("equipment", "downPayment", downPayment);
    
    // Calculate and update loan amount
    const devicePrice = parseFloat(data.equipment?.devicePrice) || 0;
    const loanAmount = devicePrice - parseFloat(downPayment);
    onChange("loanAmount", loanAmount.toString());
    
    validateField("downPayment", downPayment);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case "make":
        newErrors[field] = value ? "" : "Make is required";
        break;
      case "model":
        newErrors[field] = value ? "" : "Model is required";
        break;
      case "serialNumber":
        newErrors[field] = value ? "" : "Serial number is required";
        break;
      case "imeiNumber":
        newErrors[field] = value ? "" : "IMEI number is required";
        break;
      case "devicePrice":
        newErrors[field] = value && !isNaN(parseFloat(value)) ? "" : "Valid device price is required";
        break;
      case "downPayment":
        if (!value || isNaN(parseFloat(value))) {
          newErrors[field] = "Valid down payment is required";
        } else {
          const devicePrice = parseFloat(data.equipment?.devicePrice) || 0;
          const downPayment = parseFloat(value);
          if (downPayment < devicePrice * 0.3) {
            newErrors[field] = "Down payment must be at least 30% of device price";
          } else if (downPayment > devicePrice) {
            newErrors[field] = "Down payment cannot exceed device price";
          } else {
            newErrors[field] = "";
          }
        }
        break;
      case "invoice":
        newErrors[field] = value ? "" : "Invoice is required";
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[field];
  };

  // Helper function to check if a file is an image
  const isImageFile = (file) => {
    if (!file) return false;
    if (typeof file === 'string') {
      // Check if URL seems to be an image
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
    }
    // Check mime type if file is an object
    return file.type && file.type.startsWith('image/');
  };

  // Helper function to check if a file is a PDF
  const isPDFFile = (file) => {
    if (!file) return false;
    if (typeof file === 'string') {
      return /\.pdf$/i.test(file);
    }
    return file.type === 'application/pdf';
  };

  // Format currency for display
  const formatCurrency = (value) => {
    const amount = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Calculate down payment percentage
  const calculateDownPaymentPercentage = () => {
    const devicePrice = parseFloat(data.equipment?.devicePrice) || 0;
    const downPayment = parseFloat(data.equipment?.downPayment) || 0;
    return devicePrice > 0 ? (downPayment / devicePrice * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Equipment Details</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Make <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., Apple, Samsung, Xiaomi"
                value={data.equipment?.make || ''}
                onChange={(e) => {
                  onNestedChange("equipment", "make", e.target.value);
                  validateField("make", e.target.value);
                }}
              />
              {errors.make && <p className="text-red-500 text-xs">{errors.make}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Model <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., iPhone 15, Galaxy S23"
                value={data.equipment?.model || ''}
                onChange={(e) => {
                  onNestedChange("equipment", "model", e.target.value);
                  validateField("model", e.target.value);
                }}
              />
              {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Serial Number <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter device serial number"
                value={data.equipment?.serialNumber || ''}
                onChange={(e) => {
                  onNestedChange("equipment", "serialNumber", e.target.value);
                  validateField("serialNumber", e.target.value);
                }}
              />
              {errors.serialNumber && <p className="text-red-500 text-xs">{errors.serialNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>IMEI Number <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter device IMEI number"
                value={data.equipment?.imeiNumber || ''}
                onChange={(e) => {
                  onNestedChange("equipment", "imeiNumber", e.target.value);
                  validateField("imeiNumber", e.target.value);
                }}
              />
              {errors.imeiNumber && <p className="text-red-500 text-xs">{errors.imeiNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input
                placeholder="e.g., 128GB, 256GB"
                value={data.equipment?.capacity || ''}
                onChange={(e) => onNestedChange("equipment", "capacity", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Generation</Label>
              <Input
                placeholder="e.g., 5th generation, Pro"
                value={data.equipment?.generation || ''}
                onChange={(e) => onNestedChange("equipment", "generation", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Year of Manufacture</Label>
              <Input
                placeholder="e.g., 2023"
                value={data.equipment?.yom || ''}
                onChange={(e) => onNestedChange("equipment", "yom", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Market Value (LKR)</Label>
              <Input
                type="number"
                placeholder="Enter market value"
                value={data.equipment?.valuationAmount || ''}
                onChange={(e) => onNestedChange("equipment", "valuationAmount", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Device Price (LKR) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="Enter device price"
                value={data.equipment?.devicePrice || ''}
                onChange={handleDevicePriceChange}
              />
              {errors.devicePrice && <p className="text-red-500 text-xs">{errors.devicePrice}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Down Payment (LKR) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="Enter down payment (min 30%)"
                value={data.equipment?.downPayment || ''}
                onChange={handleDownPaymentChange}
              />
              {errors.downPayment && <p className="text-red-500 text-xs">{errors.downPayment}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invoice Upload */}
          <div className="space-y-2">
            <Label>Invoice <span className="text-red-500">*</span></Label>
            {previews.invoice ? (
              <div className="relative border rounded-lg p-4">
                <div className="flex items-center">
                  {isImageFile(data.equipment?.documents?.invoice) ? (
                    <img
                      src={previews.invoice}
                      alt="Invoice"
                      className="h-24 w-32 object-cover rounded-md mr-4"
                    />
                  ) : isPDFFile(data.equipment?.documents?.invoice) ? (
                    <div className="h-24 w-32 bg-red-50 rounded-md flex items-center justify-center mr-4">
                      <File className="h-12 w-12 text-red-500" />
                    </div>
                  ) : (
                    <div className="h-24 w-32 bg-blue-50 rounded-md flex items-center justify-center mr-4">
                      <File className="h-12 w-12 text-blue-500" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">Invoice Document</h4>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {data.equipment?.documents?.invoice?.name || "Invoice"}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={handleInvoiceRemove}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center hover:bg-gray-50">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleInvoiceUpload}
                />
                <File className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Upload Invoice</p>
                <p className="text-xs text-gray-500 mt-1">PDF, Word or Image files accepted</p>
              </div>
            )}
            {errors.invoice && <p className="text-red-500 text-xs">{errors.invoice}</p>}
          </div>

          {/* Device Images */}
          <div className="space-y-2">
            <Label>Device Images <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Max 4 images)</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Display uploaded images */}
              {previews.deviceImages.map((preview, index) => (
                <div
                  key={`device-${index}`}
                  className="relative aspect-square border rounded-md overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Device ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 h-6 w-6 rounded-full"
                    onClick={() => handleDeviceImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {/* Upload button if less than 4 images */}
              {(data.equipment?.documents?.deviceImages?.length || 0) < 4 && (
                <div className="relative aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple={true}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={handleDeviceImageUpload}
                  />
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Photos</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg">Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Loan Information */}
            <div className="grid grid-cols-2 gap-y-3">
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Device Price:</div>
                <div className="font-medium">{formatCurrency(data.equipment?.devicePrice || 0)}</div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Down Payment:</div>
                <div className="font-medium">{formatCurrency(data.equipment?.downPayment || 0)} ({calculateDownPaymentPercentage()}%)</div>
              </div>
              
              <div className="col-span-2">
                <div className="h-2 w-full bg-gray-200 rounded-full my-2">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{
                      width: `${calculateDownPaymentPercentage()}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Loan Amount:</div>
                <div className="font-medium text-blue-600">{formatCurrency(calculateLoanAmount())}</div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Loan Period:</div>
                <div className="font-medium">{data.period || 12} Months</div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Monthly Rental:</div>
                <div className="font-medium">{formatCurrency(data.rental || 0)}</div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">IRR Rate:</div>
                <div className="font-medium">{data.irrRate || 0}%</div>
              </div>
              
              <div className="col-span-2 border-t pt-2 mt-2">
                <div className="text-sm text-gray-600">Total Repayment:</div>
                <div className="font-medium">{formatCurrency((parseFloat(data.rental || 0) * parseFloat(data.period || 0)))}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
