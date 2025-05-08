// components/applyforequipment/EQDocumentUploadStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Camera, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function EQDocumentUploadStep({ data, onChange }) {
  const [errors, setErrors] = useState({
    deviceImages: "",
    invoice: "",
    residence: "",
    selfie: ""
  });

  const [previews, setPreviews] = useState({
    deviceImages: [],
    invoice: null,
    residence: null,
    selfie: null
  });

  useEffect(() => {
    const newPreviews = {
      deviceImages: [],
      invoice: null,
      residence: null,
      selfie: null
    };

    // Handle device images
    if (data.equipment?.documents?.deviceImages) {
      if (Array.isArray(data.equipment.documents.deviceImages)) {
        newPreviews.deviceImages = data.equipment.documents.deviceImages.map(img => {
          if (typeof img === 'object' && 'type' in img) {
            return URL.createObjectURL(img);
          }
          return img; // If it's already a URL
        });
      }
    }

    // Handle invoice
    if (data.equipment?.documents?.invoice) {
      if (typeof data.equipment.documents.invoice === 'object' && 'type' in data.equipment.documents.invoice) {
        newPreviews.invoice = URL.createObjectURL(data.equipment.documents.invoice);
      } else if (typeof data.equipment.documents.invoice === "string") {
        newPreviews.invoice = data.equipment.documents.invoice;
      }
    }

    // Handle residence image
    if (data.investigationImages?.residence) {
      if (typeof data.investigationImages.residence === 'object' && 'type' in data.investigationImages.residence) {
        newPreviews.residence = URL.createObjectURL(data.investigationImages.residence);
      } else if (typeof data.investigationImages.residence === "string") {
        newPreviews.residence = data.investigationImages.residence;
      }
    }

    // Handle selfie
    if (data.investigationImages?.selfie) {
      if (typeof data.investigationImages.selfie === 'object' && 'type' in data.investigationImages.selfie) {
        newPreviews.selfie = URL.createObjectURL(data.investigationImages.selfie);
      } else if (typeof data.investigationImages.selfie === "string") {
        newPreviews.selfie = data.investigationImages.selfie;
      }
    }

    setPreviews(newPreviews);

    return () => {
      // Clean up any created object URLs to prevent memory leaks
      newPreviews.deviceImages.forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      if (newPreviews.invoice && typeof newPreviews.invoice === 'string' && newPreviews.invoice.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.invoice);
      }

      if (newPreviews.residence && typeof newPreviews.residence === 'string' && newPreviews.residence.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.residence);
      }

      if (newPreviews.selfie && typeof newPreviews.selfie === 'string' && newPreviews.selfie.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.selfie);
      }
    };
  }, [data.equipment?.documents, data.investigationImages]);

  const validateForm = () => {
    const newErrors = {
      deviceImages: "",
      invoice: "",
      residence: "",
      selfie: ""
    };

    if (!data.equipment?.documents?.deviceImages || data.equipment.documents.deviceImages.length === 0) {
      newErrors.deviceImages = "At least one device image is required";
    }

    if (!data.equipment?.documents?.invoice) {
      newErrors.invoice = "Invoice is required";
    }

    if (!data.investigationImages?.residence) {
      newErrors.residence = "Residence image is required";
    }

    if (!data.investigationImages?.selfie) {
      newErrors.selfie = "Selfie with device is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleDeviceImageChange = (e) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    
    // Update equipment documents
    const updatedDeviceImages = data.equipment?.documents?.deviceImages 
      ? [...data.equipment.documents.deviceImages] 
      : [];
    
    files.forEach(file => {
      updatedDeviceImages.push(file);
    });
    
    // Limit to max 4 images
    const limitedImages = updatedDeviceImages.slice(0, 4);
    
    const updatedDocuments = {
      ...data.equipment?.documents,
      deviceImages: limitedImages
    };

    onChange("equipment", {
      ...data.equipment,
      documents: updatedDocuments
    });

    setErrors(prev => ({
      ...prev,
      deviceImages: ""
    }));
  };

  const handleDeviceImageRemove = (index) => {
    // Remove from data state
    const updatedDeviceImages = data.equipment?.documents?.deviceImages 
      ? [...data.equipment.documents.deviceImages] 
      : [];
    
    updatedDeviceImages.splice(index, 1);
    
    const updatedDocuments = {
      ...data.equipment?.documents,
      deviceImages: updatedDeviceImages
    };

    onChange("equipment", {
      ...data.equipment,
      documents: updatedDocuments
    });

    // Remove from preview
    const updatedPreviews = [...previews.deviceImages];
    
    // Revoke object URL
    if (typeof updatedPreviews[index] === 'string' && updatedPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(updatedPreviews[index]);
    }
    
    updatedPreviews.splice(index, 1);
    
    setPreviews(prev => ({
      ...prev,
      deviceImages: updatedPreviews
    }));
  };

  const handleInvoiceChange = (e) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    // Update equipment documents
    const updatedDocuments = {
      ...data.equipment?.documents,
      invoice: file
    };

    onChange("equipment", {
      ...data.equipment,
      documents: updatedDocuments
    });

    setErrors(prev => ({
      ...prev,
      invoice: ""
    }));

    // Create object URL for preview
    if (previews.invoice && typeof previews.invoice === 'string' && previews.invoice.startsWith('blob:')) {
      URL.revokeObjectURL(previews.invoice);
    }
    
    setPreviews(prev => ({
      ...prev,
      invoice: URL.createObjectURL(file)
    }));
  };

  const handleInvoiceRemove = () => {
    // Update data state
    const updatedDocuments = {
      ...data.equipment?.documents,
      invoice: null
    };

    onChange("equipment", {
      ...data.equipment,
      documents: updatedDocuments
    });

    // Revoke object URL
    if (previews.invoice && typeof previews.invoice === 'string' && previews.invoice.startsWith('blob:')) {
      URL.revokeObjectURL(previews.invoice);
    }
    
    setPreviews(prev => ({
      ...prev,
      invoice: null
    }));
  };

  const handleResidenceImageChange = (e) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    // Update investigation images
    onChange("investigationImages", {
      ...data.investigationImages,
      residence: file
    });

    setErrors(prev => ({
      ...prev,
      residence: ""
    }));

    // Create object URL for preview
    if (previews.residence && typeof previews.residence === 'string' && previews.residence.startsWith('blob:')) {
      URL.revokeObjectURL(previews.residence);
    }
    
    setPreviews(prev => ({
      ...prev,
      residence: URL.createObjectURL(file)
    }));
  };

  const handleResidenceImageRemove = () => {
    // Update data state
    onChange("investigationImages", {
      ...data.investigationImages,
      residence: null
    });

    // Revoke object URL
    if (previews.residence && typeof previews.residence === 'string' && previews.residence.startsWith('blob:')) {
      URL.revokeObjectURL(previews.residence);
    }
    
    setPreviews(prev => ({
      ...prev,
      residence: null
    }));
  };

  const handleSelfieChange = (e) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    // Update investigation images
    onChange("investigationImages", {
      ...data.investigationImages,
      selfie: file
    });

    setErrors(prev => ({
      ...prev,
      selfie: ""
    }));

    // Create object URL for preview
    if (previews.selfie && typeof previews.selfie === 'string' && previews.selfie.startsWith('blob:')) {
      URL.revokeObjectURL(previews.selfie);
    }
    
    setPreviews(prev => ({
      ...prev,
      selfie: URL.createObjectURL(file)
    }));
  };

  const handleSelfieRemove = () => {
    // Update data state
    onChange("investigationImages", {
      ...data.investigationImages,
      selfie: null
    });

    // Revoke object URL
    if (previews.selfie && typeof previews.selfie === 'string' && previews.selfie.startsWith('blob:')) {
      URL.revokeObjectURL(previews.selfie);
    }
    
    setPreviews(prev => ({
      ...prev,
      selfie: null
    }));
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Required Documentation</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Images */}
          <div className="space-y-4">
            <Label>Device Images <span className="text-red-500 ml-1">*</span> <span className="text-xs text-gray-500">(Max 4 images)</span></Label>
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
              {(previews.deviceImages.length || 0) < 4 && (
                <div
                  className={cn(
                    "aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative",
                    errors.deviceImages ? "border-red-500" : "border-gray-300"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple={true}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleDeviceImageChange}
                  />
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Photos</span>
                </div>
              )}
            </div>
            {errors.deviceImages && <p className="text-red-500 text-xs">{errors.deviceImages}</p>}
          </div>
          
          {/* Invoice Upload */}
          <div className="space-y-4">
            <Label>Device Invoice <span className="text-red-500 ml-1">*</span></Label>
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
              <div
                className={cn(
                  "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative",
                  errors.invoice ? "border-red-500" : "border-gray-300"
                )}
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleInvoiceChange}
                />
                <File className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Upload Invoice</p>
                <p className="text-xs text-gray-500 mt-1">PDF, Word or Image files accepted</p>
              </div>
            )}
            {errors.invoice && <p className="text-red-500 text-xs">{errors.invoice}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigation Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Residence Images */}
          <div className="space-y-4">
            <Label>Residence Image <span className="text-red-500 ml-1">*</span></Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative h-48",
                errors.residence ? "border-red-500" : "border-gray-300"
              )}
            >
              {previews.residence ? (
                <div className="relative h-full">
                  <div className="relative h-full w-full">
                    <img
                      src={previews.residence}
                      alt="Residence Image"
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={handleResidenceImageRemove}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleResidenceImageChange}
                  />
                  <div className="flex flex-col items-center justify-center h-full">
                    <Camera className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Upload Residence Image</p>
                  </div>
                </>
              )}
            </div>
            {errors.residence && (
              <p className="text-red-500 text-xs">{errors.residence}</p>
            )}
          </div>
          
          {/* Selfie with Device */}
          <div className="space-y-4">
            <Label>Selfie with Device <span className="text-red-500 ml-1">*</span></Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative h-48",
                errors.selfie ? "border-red-500" : "border-gray-300"
              )}
            >
              {previews.selfie ? (
                <div className="relative h-full">
                  <div className="relative h-full w-full">
                    <img
                      src={previews.selfie}
                      alt="Selfie with Device"
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={handleSelfieRemove}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleSelfieChange}
                  />
                  <div className="flex flex-col items-center justify-center h-full">
                    <Camera className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Upload Selfie with Device</p>
                  </div>
                </>
              )}
            </div>
            {errors.selfie && (
              <p className="text-red-500 text-xs">{errors.selfie}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
