// components/installment/PaymentPopupCard.jsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function PaymentPopupCard({
  open,
  onClose,
  rentalAmount,
  arrearsAmount = 0,
  contractNo,
  borrowerName
}) {
  const [amount, setAmount] = useState(rentalAmount || 0);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [errors, setErrors] = useState({});

  // Calculate total amount to be paid with proper error handling
  const totalAmount = parseFloat(amount || 0) + parseFloat(arrearsAmount || 0);

  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    
    if (!paymentDate) {
      newErrors.date = "Payment date is required";
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }
    
    // If bank transfer or check, reference number is required
    if ((paymentMethod === "bankTransfer" || paymentMethod === "cheque") && !referenceNo) {
      newErrors.referenceNo = "Reference number is required for this payment method";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically process the payment
      // For this example, we'll just prepare the data object to return
      const paymentData = {
        amount: parseFloat(amount),
        arrearsAmount: parseFloat(arrearsAmount || 0),
        totalAmount,
        paymentDate,
        paymentMethod,
        referenceNo: referenceNo || null,
        contractNo,
        borrowerName,
        timestamp: new Date().toISOString()
      };
      
      // Call onClose and pass the payment data
      onClose(paymentData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] sm:rounded-lg sm:shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Make Payment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Contract Info */}
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
            <p className="text-sm text-gray-600">Contract: {contractNo}</p>
            <p className="text-sm text-gray-600">Borrower: {borrowerName}</p>
          </div>
          
          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter payment amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>
          
          {/* Payment Date */}
          <div className="space-y-2">
            <Label className="text-sm">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${errors.date ? "border-red-500" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>
          
          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm">Payment Method</Label>
            <Select
              defaultValue={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="mobileMoney">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod}</p>}
          </div>
          
          {/* Reference Number (conditionally shown) */}
          {(paymentMethod === "bankTransfer" || paymentMethod === "cheque") && (
            <div className="space-y-2">
              <Label htmlFor="referenceNo" className="text-sm">
                {paymentMethod === "bankTransfer" ? "Transaction Reference" : "Cheque Number"}
              </Label>
              <Input
                id="referenceNo"
                type="text"
                placeholder={`Enter ${paymentMethod === "bankTransfer" ? "reference number" : "cheque number"}`}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className={errors.referenceNo ? "border-red-500" : ""}
              />
              {errors.referenceNo && <p className="text-xs text-red-500">{errors.referenceNo}</p>}
            </div>
          )}
          
          {/* Payment Summary */}
          <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <div className="flex justify-between text-sm">
              <span>Payment Amount:</span>
              <span>LKR {parseFloat(amount || 0).toLocaleString()}</span>
            </div>
            {arrearsAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600 mt-1">
                <span>Arrears:</span>
                <span>LKR {parseFloat(arrearsAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-sm mt-2 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>LKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Complete Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
