"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentUploadStep({ data, onChange }) {
  const [errors, setErrors] = useState({
    residenceImage: "",
    businessImage: "",
  });

  const [previews, setPreviews] = useState({
    residence: null,
    business: null,
  });

  const isAutoLoan = data.loanType === "AUTO";

  useEffect(() => {
    const newPreviews = {};

    const residence = data.investigationImages?.residence;
    const business = data.investigationImages?.business;

    if (residence instanceof File) {
      newPreviews.residence = URL.createObjectURL(residence);
    } else if (typeof residence === "string") {
      newPreviews.residence = residence;
    } else {
      newPreviews.residence = null;
    }

    if (business instanceof File) {
      newPreviews.business = URL.createObjectURL(business);
    } else if (typeof business === "string") {
      newPreviews.business = business;
    } else {
      newPreviews.business = null;
    }

    setPreviews(newPreviews);

    return () => {
      if (newPreviews.residence instanceof Blob) URL.revokeObjectURL(newPreviews.residence);
      if (newPreviews.business instanceof Blob) URL.revokeObjectURL(newPreviews.business);
    };
  }, [data.investigationImages]);

  const validateForm = () => {
    const newErrors = {
      residenceImage: "",
      businessImage: "",
    };

    if (!data.investigationImages?.residence) {
      newErrors.residenceImage = "Residence selfie is required";
    }

    if (!isAutoLoan && !data.investigationImages?.business) {
      newErrors.businessImage = "Business selfie is required";
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
      [type === "residence" ? "residenceImage" : "businessImage"]: "",
    }));
  };

  const handleImageRemove = (type) => {
    const updatedImages = {
      ...data.investigationImages,
      [type]: null,
    };

    onChange("investigationImages", updatedImages);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Required Documentation</h2>

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
                <img
                  src={previews.residence}
                  alt="Residence Selfie"
                  className="h-full w-full object-cover rounded"
                />
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
                  <img
                    src={previews.business}
                    alt="Business Selfie"
                    className="h-full w-full object-cover rounded"
                  />
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
      </div>
    </div>
  );
}
