// components/applyforloan/PaymentDetailsStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentDetailsStep({ data, onChange, onNestedChange }) {
  const [errors, setErrors] = useState({
    payments: {
      initialPayment: '',
      serviceCharges: '',
      documentationCharges: '',
      rmvCharges: '',
      insuranceCharges: '',
      otherCharges: '',
    }
  });

  // Set of capitalized charges
  const [capitalized, setCapitalized] = useState({
    initialPayment: false,
    serviceCharges: false,
    documentationCharges: true, // Default setting as per Excel
    rmvCharges: false,
    insuranceCharges: false,
  });

  // Calculate totals
  const totalCharges = (
    parseFloat(data.payments?.initialPayment || 0) +
    parseFloat(data.payments?.serviceCharges || 0) +
    parseFloat(data.payments?.documentationCharges || 0) +
    parseFloat(data.payments?.rmvCharges || 0) +
    parseFloat(data.payments?.insuranceCharges || 0) +
    parseFloat(data.payments?.otherCharges || 0)
  );

  // Calculate loan details
  const loanAmount = parseFloat(data.loanAmount || 0);
  const totalCapitalizedCharges = Object.entries(capitalized).reduce((total, [key, isCapitalized]) => {
    return total + (isCapitalized ? parseFloat(data.payments?.[key] || 0) : 0);
  }, 0);
  const totalPayable = loanAmount + totalCapitalizedCharges;

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.payments]);

  // Update data.capitalizedCharges when capitalized state changes
  useEffect(() => {
    onChange('capitalizedCharges', capitalized);
  }, [capitalized]);

  const validateForm = () => {
    const newErrors = {
      payments: {
        initialPayment: '',
        serviceCharges: '',
        documentationCharges: '',
        rmvCharges: '',
        insuranceCharges: '',
        otherCharges: '',
      }
    };

    // Validate all payment fields
    // These are all optional, but must be valid numbers if provided
    if (data.payments?.initialPayment && (isNaN(data.payments.initialPayment) || parseFloat(data.payments.initialPayment) < 0)) {
      newErrors.payments.initialPayment = 'Please enter a valid amount';
    }

    if (data.payments?.serviceCharges && (isNaN(data.payments.serviceCharges) || parseFloat(data.payments.serviceCharges) < 0)) {
      newErrors.payments.serviceCharges = 'Please enter a valid amount';
    }

    if (data.payments?.documentationCharges && (isNaN(data.payments.documentationCharges) || parseFloat(data.payments.documentationCharges) < 0)) {
      newErrors.payments.documentationCharges = 'Please enter a valid amount';
    }

    if (data.payments?.rmvCharges && (isNaN(data.payments.rmvCharges) || parseFloat(data.payments.rmvCharges) < 0)) {
      newErrors.payments.rmvCharges = 'Please enter a valid amount';
    }

    if (data.payments?.insuranceCharges && (isNaN(data.payments.insuranceCharges) || parseFloat(data.payments.insuranceCharges) < 0)) {
      newErrors.payments.insuranceCharges = 'Please enter a valid amount';
    }

    if (data.payments?.otherCharges && (isNaN(data.payments.otherCharges) || parseFloat(data.payments.otherCharges) < 0)) {
      newErrors.payments.otherCharges = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return !Object.values(newErrors.payments).some(value => value !== '');
  };

  const handlePaymentChange = (field, value) => {
    onNestedChange('payments', field, value);
    
    // Clear error when field is edited
    setErrors(prev => ({
      ...prev,
      payments: {
        ...prev.payments,
        [field]: ''
      }
    }));
  };

  const handleCapitalizedChange = (field, value) => {
    setCapitalized(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payment Details</h2>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 text-sm">
          Please specify the additional charges associated with this loan. 
          Capitalized charges will be added to the loan amount.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center font-medium text-sm pb-2 border-b">
        <div className="md:col-span-2">Charge Type</div>
        <div>Amount (LKR)</div>
        <div className="text-center">Capitalized</div>
        <div>Info</div>
      </div>
      
      <div className="space-y-4">
        {/* Initial Payment */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="initialPayment">
              Initial Payment
            </Label>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="initialPayment"
                type="number"
                value={data.payments?.initialPayment || ''}
                onChange={(e) => handlePaymentChange('initialPayment', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.payments.initialPayment ? "border-red-500" : ""}`}
              />
            </div>
            {errors.payments.initialPayment && <p className="text-red-500 text-xs mt-1">{errors.payments.initialPayment}</p>}
          </div>
          <div className="flex justify-center">
            <Switch
              checked={capitalized.initialPayment}
              onCheckedChange={(checked) => handleCapitalizedChange('initialPayment', checked)}
            />
          </div>
          <div className="text-xs text-gray-500">
            One-time payment collected at loan disbursement
          </div>
        </div>

        {/* Service Charges */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="serviceCharges">
              Service Charges
            </Label>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="serviceCharges"
                type="number"
                value={data.payments?.serviceCharges || ''}
                onChange={(e) => handlePaymentChange('serviceCharges', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.payments.serviceCharges ? "border-red-500" : ""}`}
              />
            </div>
            {errors.payments.serviceCharges && <p className="text-red-500 text-xs mt-1">{errors.payments.serviceCharges}</p>}
          </div>
          <div className="flex justify-center">
            <Switch
              checked={capitalized.serviceCharges}
              onCheckedChange={(checked) => handleCapitalizedChange('serviceCharges', checked)}
            />
          </div>
          <div className="text-xs text-gray-500">
            Fees for loan processing and services
          </div>
        </div>

        {/* Documentation Charges */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="documentationCharges">
              Documentation Charges
            </Label>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="documentationCharges"
                type="number"
                value={data.payments?.documentationCharges || ''}
                onChange={(e) => handlePaymentChange('documentationCharges', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.payments.documentationCharges ? "border-red-500" : ""}`}
              />
            </div>
            {errors.payments.documentationCharges && <p className="text-red-500 text-xs mt-1">{errors.payments.documentationCharges}</p>}
          </div>
          <div className="flex justify-center">
            <Switch
              checked={capitalized.documentationCharges}
              onCheckedChange={(checked) => handleCapitalizedChange('documentationCharges', checked)}
            />
          </div>
          <div className="text-xs text-gray-500">
            Charges for document preparation and filing
          </div>
        </div>

        {/* RMV Charges */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="rmvCharges">
              RMV Charges
            </Label>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="rmvCharges"
                type="number"
                value={data.payments?.rmvCharges || ''}
                onChange={(e) => handlePaymentChange('rmvCharges', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.payments.rmvCharges ? "border-red-500" : ""}`}
              />
            </div>
            {errors.payments.rmvCharges && <p className="text-red-500 text-xs mt-1">{errors.payments.rmvCharges}</p>}
          </div>
          <div className="flex justify-center">
            <Switch
              checked={capitalized.rmvCharges}
              onCheckedChange={(checked) => handleCapitalizedChange('rmvCharges', checked)}
            />
          </div>
          <div className="text-xs text-gray-500">
            Registration of Motor Vehicles charges (for Auto Loans)
          </div>
        </div>

        {/* Insurance Charges */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="insuranceCharges">
              Insurance Charges
            </Label>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="insuranceCharges"
                type="number"
                value={data.payments?.insuranceCharges || ''}
                onChange={(e) => handlePaymentChange('insuranceCharges', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.payments.insuranceCharges ? "border-red-500" : ""}`}
              />
            </div>
            {errors.payments.insuranceCharges && <p className="text-red-500 text-xs mt-1">{errors.payments.insuranceCharges}</p>}
          </div>
          <div className="flex justify-center">
            <Switch
              checked={capitalized.insuranceCharges}
              onCheckedChange={(checked) => handleCapitalizedChange('insuranceCharges', checked)}
            />
          </div>
          <div className="text-xs text-gray-500">
            Insurance premium for vehicle or loan protection
          </div>
        </div>

        {/* Other Charges */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="otherCharges">
              Other Charges
            </Label>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="otherCharges"
                type="number"
                value={data.payments?.otherCharges || ''}
                onChange={(e) => handlePaymentChange('otherCharges', e.target.value)}
                placeholder="0.00"
                className={`pl-12 ${errors.payments.otherCharges ? "border-red-500" : ""}`}
              />
            </div>
            {errors.payments.otherCharges && <p className="text-red-500 text-xs mt-1">{errors.payments.otherCharges}</p>}
          </div>
          <div className="flex justify-center">
            {/* Disabled since other charges are typically not capitalized */}
            <Checkbox disabled checked={false} />
          </div>
          <div className="text-xs text-gray-500">
            Any additional charges not covered above
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mt-8">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-gray-500" />
            <h3 className="font-medium">Payment Summary</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Additional Charges</span>
              <span className="font-medium">LKR {formatCurrency(totalCharges)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Capitalized Charges</span>
              <span className="font-medium">LKR {formatCurrency(totalCapitalizedCharges)}</span>
            </div>
            
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm">Original Loan Amount</span>
                <span className="font-medium">LKR {formatCurrency(loanAmount)}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Total Loan Amount (with capitalized charges)</span>
                <span className="text-lg text-blue-600">LKR {formatCurrency(totalPayable)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm mt-2 text-gray-500">
        <p><strong>Note:</strong> Capitalized charges are added to the loan amount and will be included in the repayment calculations.</p>
      </div>
    </div>
  );
}
