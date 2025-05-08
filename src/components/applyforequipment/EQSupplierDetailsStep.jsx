// components/applyforequipment/EQSupplierDetailsStep.jsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EQSupplierDetailsStep({ data, onChange, onNestedChange }) {
  const [errors, setErrors] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
  });

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case "name":
        newErrors[field] = value ? "" : "Supplier name is required";
        break;
      case "accountNumber":
        newErrors[field] = value ? "" : "Account number is required";
        break;
      case "bankName":
        newErrors[field] = value ? "" : "Bank name is required";
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[field];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Device Supplier Details</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Supplier Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter supplier name"
                value={data.supplier?.name || ''}
                onChange={(e) => {
                  onNestedChange("supplier", "name", e.target.value);
                  validateField("name", e.target.value);
                }}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Business Registration Number</Label>
              <Input
                placeholder="Enter BR number"
                value={data.supplier?.brNumber || ''}
                onChange={(e) => onNestedChange("supplier", "brNumber", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>ID Number</Label>
              <Input
                placeholder="Enter ID number"
                value={data.supplier?.idNumber || ''}
                onChange={(e) => onNestedChange("supplier", "idNumber", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Account Number <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter account number"
                value={data.supplier?.accountNumber || ''}
                onChange={(e) => {
                  onNestedChange("supplier", "accountNumber", e.target.value);
                  validateField("accountNumber", e.target.value);
                }}
              />
              {errors.accountNumber && <p className="text-red-500 text-xs">{errors.accountNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Bank Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter bank name"
                value={data.supplier?.bankName || ''}
                onChange={(e) => {
                  onNestedChange("supplier", "bankName", e.target.value);
                  validateField("bankName", e.target.value);
                }}
              />
              {errors.bankName && <p className="text-red-500 text-xs">{errors.bankName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Branch Name</Label>
              <Input
                placeholder="Enter branch name"
                value={data.supplier?.branchName || ''}
                onChange={(e) => onNestedChange("supplier", "branchName", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
