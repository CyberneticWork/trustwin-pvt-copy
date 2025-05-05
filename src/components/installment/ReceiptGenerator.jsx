// components/installment/ReceiptGenerator.jsx
"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";

export default function ReceiptGenerator({
  receiptNo,
  payerName,
  date,
  amount,
  rentalNo,
  capital,
  interest,
  arrears,
  officerName,
  companyLogo = "/logo.png",
  companyName = "MicroFinance Solutions",
  companyAddress = "123 Finance Street, Colombo, Sri Lanka",
  companyPhone = "+94 11 234 5678",
  branchCode = "JE"
}) {
  // Generate default receipt number if not provided
  const [displayReceiptNo] = useState(
    receiptNo || 
    `${branchCode}REN${Math.floor(100000 + Math.random() * 900000)}`
  );
  
  // Reference for the printable content
  const componentRef = useRef();
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Receipt-${displayReceiptNo}`,
    onAfterPrint: () => console.log("Printed successfully")
  });
  
  // Format date properly
  const formattedDate = typeof date === 'string' ? date : date instanceof Date ? 
    new Date(date).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '.') : 
    new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '.');
  
  // Calculate total amount if separate parts are provided
  const totalAmount = amount || (parseFloat(capital || 0) + parseFloat(interest || 0) + parseFloat(arrears || 0));

  return (
    <div className="w-full">
      {/* Preview and Print Button */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Payment Receipt</h3>
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Print Receipt
        </Button>
      </div>
      
      {/* Printable Receipt */}
      <Card className="p-0 overflow-hidden shadow-lg border border-gray-200">
        <div ref={componentRef} className="p-6 bg-white">
          {/* Receipt Header */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {/* Company Logo */}
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                {companyLogo ? (
                  <img src={companyLogo} alt="Company Logo" className="max-w-full max-h-full" />
                ) : (
                  <span className="text-xl font-bold text-gray-500">MFS</span>
                )}
              </div>
              
              {/* Company Info */}
              <div>
                <h2 className="text-lg font-bold text-gray-800">{companyName}</h2>
                <p className="text-xs text-gray-500">{companyAddress}</p>
                <p className="text-xs text-gray-500">{companyPhone}</p>
              </div>
            </div>
            
            {/* Receipt Number and Date */}
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800">RECEIPT</h3>
              <p className="text-sm mt-1"><span className="font-medium">No:</span> {displayReceiptNo}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {formattedDate}</p>
            </div>
          </div>
          
          {/* Receipt Body */}
          <div className="py-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Received From:</span>
              <span className="text-sm">{payerName}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Rental Number:</span>
              <span className="text-sm">{rentalNo || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
              <span className="text-sm font-medium">Officer Name:</span>
              <span className="text-sm">{officerName || 'N/A'}</span>
            </div>
            
            {/* Payment Breakdown */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium mb-2">Payment Details:</h4>
              
              <div className="flex justify-between">
                <span className="text-sm">Capital</span>
                <span className="text-sm">LKR {parseFloat(capital || 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Interest</span>
                <span className="text-sm">LKR {parseFloat(interest || 0).toLocaleString()}</span>
              </div>
              
              {arrears > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Arrears</span>
                  <span className="text-sm">LKR {parseFloat(arrears).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {/* Total Amount */}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold">LKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Receipt Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Received with thanks</p>
              </div>
              
              <div className="text-right">
                <div className="w-40 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-gray-500">Authorized Signature</p>
              </div>
            </div>
            
            <p className="mt-6 text-xs text-gray-500 text-center">
              This receipt is computer generated and does not require a physical signature.
            </p>
          </div>
          
          {/* Generated timestamp in small print */}
          <div className="mt-4 text-[10px] text-gray-400 text-center">
            Generated on: {new Date().toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  );
}
