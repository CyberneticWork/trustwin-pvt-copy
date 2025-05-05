"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Camera, File } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentUploadStep({ data, onChange }) {
  const [errors, setErrors] = useState({
    residenceImage: "",
    businessImage: "",
    paysheetImage: "",
  });

  const [previews, setPreviews] = useState({
    residence: null,
    business: null,
    paysheet: null,
  });

  const isAutoLoan = data.loanType === "AUTO";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    residence: null,
    business: null,
    paysheet: null
  });

  useEffect(() => {
    const newPreviews = {};

    const residence = data.investigationImages?.residence;
    const business = data.investigationImages?.business;
    const paysheet = data.investigationImages?.paysheet;

    // Check for residence image
    if (residence && typeof residence === 'object' && 'type' in residence) {
      newPreviews.residence = URL.createObjectURL(residence);
    } else if (typeof residence === "string") {
      newPreviews.residence = residence;
    } else {
      newPreviews.residence = null;
    }

    // Check for business image
    if (business && typeof business === 'object' && 'type' in business) {
      newPreviews.business = URL.createObjectURL(business);
    } else if (typeof business === "string") {
      newPreviews.business = business;
    } else {
      newPreviews.business = null;
    }

    // Check for paysheet document
    if (paysheet && typeof paysheet === 'object' && 'type' in paysheet) {
      newPreviews.paysheet = URL.createObjectURL(paysheet);
    } else if (typeof paysheet === "string") {
      newPreviews.paysheet = paysheet;
    } else {
      newPreviews.paysheet = null;
    }

    setPreviews(newPreviews);

    return () => {
      // Clean up any created object URLs to prevent memory leaks
      if (newPreviews.residence && typeof newPreviews.residence === 'string' && newPreviews.residence.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.residence);
      }
      if (newPreviews.business && typeof newPreviews.business === 'string' && newPreviews.business.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.business);
      }
      if (newPreviews.paysheet && typeof newPreviews.paysheet === 'string' && newPreviews.paysheet.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews.paysheet);
      }
    };
  }, [data.investigationImages]);

  const validateForm = () => {
    const newErrors = {
      residenceImage: "",
      businessImage: "",
      paysheetImage: "",
    };

    if (!data.investigationImages?.residence) {
      newErrors.residenceImage = "Residence selfie is required";
    }

    if (!isAutoLoan && !data.investigationImages?.business) {
      newErrors.businessImage = "Business selfie is required";
    }

    if (!data.investigationImages?.paysheet) {
      newErrors.paysheetImage = "Paysheet document is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleImageChange = (type, file) => {
    if (!file) return;

    const updatedImages = {
      ...data.investigationImages,
      [type]: file,
    };

    onChange("investigationImages", updatedImages);

    setErrors((prev) => ({
      ...prev,
      [type === "residence" ? "residenceImage" : 
       type === "business" ? "businessImage" : "paysheetImage"]: "",
    }));
  };

  const handleImageRemove = (type) => {
    const updatedImages = { ...data.investigationImages };
    delete updatedImages[type];
    setPreviews({ ...previews, [type]: null });
    setUploadStatus({ ...uploadStatus, [type]: null });
    onChange("investigationImages", updatedImages);
  };

  const uploadImage = async (type, file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('loan_id', data.loanId);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with the correct boundary
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result; // The API returns the file path or URL
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handleUploadAll = async () => {
    if (!data.loanId) {
      alert('Please save the loan application first');
      return;
    }

    setIsUploading(true);
    const types = ['residence', 'business', 'paysheet'];
    const newUploadStatus = { ...uploadStatus };
    
    try {
      for (const type of types) {
        if (!data.investigationImages?.[type]) continue;
        
        try {
          newUploadStatus[type] = 'uploading';
          setUploadStatus({ ...newUploadStatus });
          
          const file = data.investigationImages[type];
          const result = await uploadImage(type, file);
          
          if (result) {
            newUploadStatus[type] = 'success';
            // Update the image URL in the parent component
            const updatedImages = {
              ...data.investigationImages,
              [type]: result.url || result.path || file.name
            };
            
          } else {
            throw new Error('No result from server');
          }
        } catch (error) {
          console.error(`Failed to upload ${type}:`, error);
          newUploadStatus[type] = 'error';
          setUploadStatus({ ...newUploadStatus });
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'error':
        return <span className="text-red-500">✗</span>;
      case 'uploading':
        return <span className="animate-spin">⟳</span>;
      default:
        return null;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Required Documentation</h2>
        <Button
          onClick={handleUploadAll}
          disabled={isUploading || !data.investigationImages || Object.keys(data.investigationImages).length === 0}
          className="flex items-center gap-2"
        >
          {isUploading ? 'Uploading...' : 'Upload All Documents'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Residence Selfie */}
        <div className="space-y-4">
          <Label className="flex items-center">
            Residence Selfie <span className="text-red-500 ml-1">*</span>
          </Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative h-48",
              errors.residenceImage ? "border-red-500" : "border-gray-300"
            )}
          >
            {previews.residence ? (
              <div className="relative h-full">
                <div className="relative h-full w-full">
                  <img
                    src={previews.residence}
                    alt="Residence Selfie"
                    className="h-full w-full object-cover rounded"
                  />
                  {uploadStatus.residence && (
                    <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                      {getStatusIcon(uploadStatus.residence)}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                  onClick={() => handleImageRemove("residence")}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <input required 
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageChange("residence", e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center h-full">
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Upload Residence Selfie</p>
                </div>
              </>
            )}
          </div>
          {errors.residenceImage && (
            <p className="text-red-500 text-xs">{errors.residenceImage}</p>
          )}
        </div>

        {/* Business Selfie */}
        {!isAutoLoan && (
          <div className="space-y-4">
            <Label className="flex items-center">
              Business Selfie <span className="text-red-500 ml-1">*</span>
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative h-48",
                errors.businessImage ? "border-red-500" : "border-gray-300"
              )}
            >
              {previews.business ? (
                <div className="relative h-full">
                  <div className="relative h-full w-full">
                    <img
                      src={previews.business}
                      alt="Business Selfie"
                      className="h-full w-full object-cover rounded"
                    />
                    {uploadStatus.business && (
                      <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                        {getStatusIcon(uploadStatus.business)}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                    onClick={() => handleImageRemove("business")}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <input required 
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageChange("business", e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center h-full">
                    <Camera className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Upload Business Selfie</p>
                  </div>
                </>
              )}
            </div>
            {errors.businessImage && (
              <p className="text-red-500 text-xs">{errors.businessImage}</p>
            )}
          </div>
        )}

        {/* Paysheet Upload */}
        <div className="space-y-4">
          <Label className="flex items-center">
            Paysheet Document <span className="text-red-500 ml-1">*</span>
          </Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-50 relative h-48",
              errors.paysheetImage ? "border-red-500" : "border-gray-300"
            )}
          >
            {previews.paysheet ? (
              <div className="relative h-full">
                {/* Display image preview if it's an image */}
                {isImageFile(data.investigationImages?.paysheet) ? (
                  <img
                    src={previews.paysheet}
                    alt="Paysheet Document"
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  /* Display file icon for non-image files */
                  <div className="flex flex-col items-center justify-center h-full">
                    <File className="h-12 w-12 text-blue-500 mb-2" />
                    <p className="text-sm text-gray-700 font-medium truncate max-w-full">
                      {data.investigationImages?.paysheet?.name || "Paysheet Document"}
                    </p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                  onClick={() => handleImageRemove("paysheet")}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <input required 
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageChange("paysheet", e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center h-full">
                  <File className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Upload Paysheet Document</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word or Image files accepted</p>
                </div>
              </>
            )}
          </div>
          {errors.paysheetImage && (
            <p className="text-red-500 text-xs">{errors.paysheetImage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
