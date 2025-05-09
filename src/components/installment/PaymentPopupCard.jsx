// components/installment/PaymentPopupCard.jsx
"use client";

import { useState } from "react";
import { openPrintBill } from "./printBill";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, Banknote, ChevronsUp, Smartphone } from "lucide-react";

export default function PaymentPopupCard({
  open,
  onClose,
  rentalAmount,
  arrearsAmount = 0,
  contractNo,
  borrowerName
}) {
  const [lastReceipt, setLastReceipt] = useState(null);

  const [amount, setAmount] = useState(rentalAmount || 0);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [errors, setErrors] = useState({});

  // Payment breakdown: apply to arrears, then rental, then show excess if any
  let payment = parseFloat(amount || 0);
  const arrears = parseFloat(arrearsAmount || 0);
  const rental = parseFloat(rentalAmount || 0);

  let remainingArrears = arrears;
  let remainingRental = rental;
  let excess = 0;

  if (payment > 0) {
    if (payment >= remainingArrears) {
      payment -= remainingArrears;
      remainingArrears = 0;
      if (payment >= remainingRental) {
        excess = payment - remainingRental;
        remainingRental = 0;
      } else {
        remainingRental -= payment;
      }
    } else {
      remainingArrears -= payment;
    }
  }

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

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (validateForm()) {
      const userEnteredAmount = parseFloat(amount);
      const currentArrears = parseFloat(arrearsAmount || 0);
      const currentRental = parseFloat(rentalAmount || 0);

      // Calculate settlement based on the new logic
      let settlement = 0;
      if (currentArrears < userEnteredAmount) {
        settlement = userEnteredAmount - currentArrears;
      }
      // If arrears > user entered amount, settlement remains 0

      const paymentData = {
        amount: userEnteredAmount,
        arrearsAmount: currentArrears,
        totalAmount: userEnteredAmount,
        paymentDate,
        paymentMethod,
        referenceNo: referenceNo || null,
        contractNo,
        borrowerName,
        timestamp: new Date().toISOString(),
        settlement,
        remainingSettlement: settlement,
        remainingArrears: Math.max(0, currentArrears - userEnteredAmount)
      };

      // Prepare data for API
      const apiData = {
        contractid: contractNo,
        payment_number: 1,
        payment_date: paymentDate instanceof Date ? paymentDate.toISOString().split('T')[0] : paymentDate,
        amount_paid: userEnteredAmount,
        payment_method: paymentMethod,
        transaction_id: referenceNo || null,
        status: "completed",
        CRO: 1,
        notes: "",
        setalment: settlement,
        remainingSettlement: settlement
      };

      try {
        const res = await fetch('/api/loan/installment/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData)
        });
        const data = await res.json();
        if (data.code === 'SUCCESS') {
          alert('Payment saved successfully.');
          setTimeout(() => openPrintBill({
            ...paymentData,
            receiptNo: data.receiptNo || Math.floor(Math.random()*1000000),
            paidAt: new Date(),
            referenceNo: data.paymentId || data.receiptNo
          }), 500);
          onClose(paymentData);
        } else {
          alert('Payment failed: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Payment failed: ' + err.message);
      }
    }
  };


 

// Payment method icons and styling
const paymentMethodIcons = {
    cash: <Banknote className="h-4 w-4 text-green-500" />,
    bankTransfer: <CreditCard className="h-4 w-4 text-blue-500" />,
    cheque: <ChevronsUp className="h-4 w-4 text-purple-500" />,
    mobileMoney: <Smartphone className="h-4 w-4 text-orange-500" />
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[450px] sm:rounded-xl bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3 mb-1">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-3 -mt-6 -mx-6 mb-2">
            <DialogTitle className="text-xl font-bold text-white text-center">Make Payment</DialogTitle>
          </div>
          {/* Contract Info */}
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700">Contract</p>
                <p className="text-sm font-semibold text-blue-700">{contractNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">Borrower</p>
                <p className="text-sm font-semibold text-blue-700">{borrowerName}</p>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-1 space-y-3">
          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Payment Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LKR</span>
              <Input
                id="amount"
                type="number"
                placeholder="Enter payment amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-12 border-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 h-10 ${errors.amount ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200"}`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 font-medium">{errors.amount}</p>}
          </div>

          {/* Payment Breakdown */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3 space-y-1">
            <h3 className="text-sm font-semibold text-indigo-700 mb-1">Payment Breakdown</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Arrears:</span>
              <span className={`font-medium ${remainingArrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
                LKR {remainingArrears.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {rental > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining Rental:</span>
                <span className={`font-medium ${remainingRental > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  LKR {remainingRental.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {excess > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Excess:</span>
                <span className="font-medium text-emerald-600">
                  LKR {excess.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
          
          {/* Payment Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal h-10 border-2 ${errors.date ? "border-red-300" : "border-gray-200 hover:border-blue-400"}`}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                  {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  className="rounded-md border-2 border-blue-100"
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date}</p>}
          </div>
          
          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
            <Select
              defaultValue={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger className={`h-10 border-2 ${errors.paymentMethod ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash" className="flex items-center py-2">
                  {paymentMethodIcons.cash}
                  <span className="ml-2">Cash</span>
                </SelectItem>
                <SelectItem value="bankTransfer" className="flex items-center py-2">
                  {paymentMethodIcons.bankTransfer}
                  <span className="ml-2">Bank Transfer</span>
                </SelectItem>
                <SelectItem value="cheque" className="flex items-center py-2">
                  {paymentMethodIcons.cheque}
                  <span className="ml-2">Cheque</span>
                </SelectItem>
                <SelectItem value="mobileMoney" className="flex items-center py-2">
                  {paymentMethodIcons.mobileMoney}
                  <span className="ml-2">Mobile Money</span>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-xs text-red-500 font-medium">{errors.paymentMethod}</p>}
          </div>
          
          {/* Reference Number (conditionally shown) */}
          {(paymentMethod === "bankTransfer" || paymentMethod === "cheque") && (
            <div className="space-y-2">
              <Label htmlFor="referenceNo" className="text-sm font-medium text-gray-700">
                {paymentMethod === "bankTransfer" ? "Transaction Reference" : "Cheque Number"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {paymentMethod === "bankTransfer" ? paymentMethodIcons.bankTransfer : paymentMethodIcons.cheque}
                </span>
                <Input
                  id="referenceNo"
                  type="text"
                  placeholder={`Enter ${paymentMethod === "bankTransfer" ? "reference number" : "cheque number"}`}
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className={`pl-10 border-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 h-10 ${errors.referenceNo ? "border-red-300" : "border-gray-200"}`}
                />
              </div>
              {errors.referenceNo && <p className="text-xs text-red-500 font-medium">{errors.referenceNo}</p>}
            </div>
          )}
          
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100 mt-2">
            <h3 className="text-sm font-semibold text-emerald-700 mb-2">Payment Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Amount:</span>
              <span className="font-medium">LKR {parseFloat(amount || 0).toLocaleString()}</span>
            </div>
            {arrearsAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600 mt-1">
                <span>Arrears:</span>
                <span className="font-medium">LKR {parseFloat(arrearsAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-emerald-700 text-base mt-2 pt-2 border-t border-green-200">
              <span>Total:</span>
              <span>LKR {(remainingArrears + remainingRental).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-4 mt-2 pt-2 border-t">
          <Button variant="outline" onClick={() => onClose()} className="h-10 text-sm border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className="h-10 text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium"
          >
            Complete Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}