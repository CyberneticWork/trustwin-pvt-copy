// app/loan-info/installments/page.jsx
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

// Import our custom components
import ArrearsCalculation from "@/components/installment/ArrearsCalculation";
import PaymentPopupCard from "@/components/installment/PaymentPopupCard";
import ReceiptGenerator from "@/components/installment/ReceiptGenerator";
import TransactionHistoryTable from "@/components/installment/TransactionHistoryTable";
import LoanSummaryDashboard from "@/components/installment/LoanSummaryDashboard";

export default function InstallmentPage() {
  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  // Sample previous comments
  const [comments, setComments] = useState([
    {
      author: "Avishka Avishka",
      date: "02.10.2024",
      text: "Customer requested a payment extension due to temporary financial difficulty.",
      timestamp: "10:24 AM"
    },
    {
      author: "Avishka Avishka",
      date: "04.10.2024",
      text: "Follow-up call made. Customer confirmed payment will be made by 05.10.2024.",
      timestamp: "02:15 PM"
    }
  ]);

  // State for new comment
  const [newComment, setNewComment] = useState("");

  // Personal Information from Excel
  const personalInfo = {
    name: "Mr. Shalitha Madhuwantha",
    nic: "200278900987",
    gender: "Male",
    civilStatus: "Single", 
    dob: "01.05.2002",
    address: "No.2000/1, Green Land, JeEla",
    mobile: "776065780",
    product: "MBL",
    productType: "BizCash",
    location: "JaEla",
    marketingOfficer: ""
  };

  // Facility Details from Excel - Now with useState to be able to update them
  const [facilityData, setFacilityData] = useState({
    group1: {
      contractNo: "JEMBL0000500",
      contractDate: "05.05.2025",
      facilityAmount: "108750.00",
      term: "15 Monthly", // Options: "12 Weekly", "6 Monthly", "24 Biweekly"
      dueDate: "28.07.2025",
      contractStatus: "Active", // Options: "Active", "Settled", "Defaulted", "Rescheduled", "Closed"
      rental: "7,250.00 Monthly", // Format: "Amount Frequency"
      agreedAmount: "0",
      arrearsAge: "-0.01", // Negative = no arrears or advance
      dueDate2: "28.07.2025"
    },
  
    group2: {
      lastPaymentDate: "05.10.2024",
      lastPaidAmount: "0",
      totalArrears: "-8.33", // Negative = overpayment
      paidRentals: "0",
      dueRentals: "15",
      totalOutstanding: "108750",
      defaultInterest: "0", // Could also be percentage or fixed amount
      paidRentalAmount: "0"
    },
  
    group3: {
      settlementAmount: "108750",
      futureCapital: "10000",
      futureInterest: "3540",
      closingDate: "05.11.2024",
      paidCapital: "0",
      paidInterest: "0",
      facilityAmount2: "50000", // For backward compatibility
      capitalAmount: "50000",
      totalInterest: "13500"
    }
  });

  // Transaction history with useState to be able to update it
  const [transactions, setTransactions] = useState([
    {
      receiptNo: "JEREN000100",
      date: "05.10.2024",
      amount: "5300",
      type: "PAYMENT",
      capital: "3000",
      interest: "1200",
      arrears: "0",
      officer: "lasantha"
    },
    {
      receiptNo: "",
      date: "05.10.2024",
      amount: "5291",
      type: "DUE RENTAL (10)",
      capital: "3001",
      interest: "1200",
      arrears: "0",
      officer: ""
    }
  ]);

  // Helper function to parse numbers with commas or decimals
  const parseAmount = (value) => {
    if (!value) return 0;
    // Remove commas and convert to number
    return parseFloat(value.toString().replace(/,/g, ''));
  };

  // Handle comment submission
  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, '.');
    
    const timeStr = today.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    setComments([...comments, {
      author: "Current User",
      date: dateStr,
      text: newComment,
      timestamp: timeStr
    }]);
    
    setNewComment("");
  };

  // Helper function to extract rental amount from string like "7,250.00 Monthly"
  const getRentalAmount = (rentalString) => {
    if (!rentalString) return 0;
    const amountPart = rentalString.split(" ")[0];
    return parseAmount(amountPart);
  };

  // Handle payment submission
  const handlePaymentSubmit = (paymentData) => {
    if (!paymentData) {
      setIsPaymentModalOpen(false);
      return;
    }
    
    console.log("Payment processed:", paymentData);
    
    // Format date for consistency
    const paymentDateFormatted = format(new Date(paymentData.paymentDate), "dd.MM.yyyy");
    
    // Generate new receipt number
    const newReceiptNo = `JEREN${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Calculate capital and interest split (60%/40% for this example)
    const capitalAmount = parseFloat(paymentData.amount) * 0.6;
    const interestAmount = parseFloat(paymentData.amount) * 0.4;
    
    // Create receipt data
    const newReceiptData = {
      receiptNo: newReceiptNo,
      payerName: personalInfo.name,
      date: paymentDateFormatted,
      amount: paymentData.amount,
      rentalNo: facilityData.group1.contractNo,
      capital: capitalAmount,
      interest: interestAmount,
      arrears: paymentData.arrearsAmount,
      officerName: "Current User"
    };
    
    // Update the transactions list with the new payment
    const newTransaction = {
      receiptNo: newReceiptNo,
      date: paymentDateFormatted,
      amount: paymentData.amount.toString(),
      type: "PAYMENT",
      description: "Receipt",
      capital: capitalAmount.toFixed(0).toString(),
      interest: interestAmount.toFixed(0).toString(),
      arrears: paymentData.arrearsAmount.toString(),
      officer: "Current User"
    };
    
    // Update transaction state
    setTransactions([newTransaction, ...transactions]);
    
    // Parse all values properly before calculations
    const facilityAmount = parseAmount(facilityData.group1.facilityAmount);
    const currentOutstanding = parseAmount(facilityData.group2.totalOutstanding) || parseAmount(facilityData.group3.settlementAmount);
    const currentArrears = Math.max(0, parseAmount(facilityData.group2.totalArrears));
    const paymentAmount = parseFloat(paymentData.amount);
    const currentPaidAmount = parseAmount(facilityData.group2.paidRentalAmount);
    
    // Apply payment first to arrears, then to outstanding balance
    let remainingPayment = paymentAmount;
    let newArrearsAmount = currentArrears;
    
    // First, apply payment to arrears if there are any
    if (currentArrears > 0) {
      if (remainingPayment >= currentArrears) {
        // Payment covers all arrears
        remainingPayment -= currentArrears;
        newArrearsAmount = 0;
      } else {
        // Payment only covers part of arrears
        newArrearsAmount = currentArrears - remainingPayment;
        remainingPayment = 0;
      }
    }
    
    // Apply any remaining payment to outstanding balance
    const newOutstanding = Math.max(0, currentOutstanding - remainingPayment);
    const newPaidAmount = (currentPaidAmount + paymentAmount);
    
    // Calculate how many full rentals have been paid
    const rentalAmount = getRentalAmount(facilityData.group1.rental);
    const newPaidRentals = Math.floor(newPaidAmount / rentalAmount);
    const totalRentals = parseInt(facilityData.group2.dueRentals) + parseInt(facilityData.group2.paidRentals);
    const newDueRentals = Math.max(0, totalRentals - newPaidRentals);
    
    // Update facility data with accurate values
    setFacilityData({
      ...facilityData,
      group1: {
        ...facilityData.group1,
        // Update contractStatus if fully paid
        contractStatus: newOutstanding <= 0 ? "Settled" : 
                       (newArrearsAmount > 0 ? "Arrears" : "Active")
      },
      group2: {
        ...facilityData.group2,
        lastPaymentDate: paymentDateFormatted,
        lastPaidAmount: paymentData.amount.toString(),
        totalOutstanding: newOutstanding.toFixed(2),
        totalArrears: newArrearsAmount.toFixed(2),
        paidRentalAmount: newPaidAmount.toFixed(2),
        paidRentals: newPaidRentals.toString(),
        dueRentals: newDueRentals.toString(),
      },
      group3: {
        ...facilityData.group3,
        settlementAmount: newOutstanding.toFixed(2),
        paidCapital: (parseAmount(facilityData.group3.paidCapital) + capitalAmount).toFixed(2),
        paidInterest: (parseAmount(facilityData.group3.paidInterest) + interestAmount).toFixed(2)
      }
    });
    
    // Show receipt
    setReceiptData(newReceiptData);
    setShowReceipt(true);
    
    // Close payment modal
    setIsPaymentModalOpen(false);
  };

  // Handle opening the payment modal
  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  // Handle statement generation
  const handleGenerateStatement = () => {
    console.log("Generating statement...");
    // Implementation for generating statement would go here
  };

  // Extract frequency from the term
  const getPaymentFrequency = () => {
    const termLower = facilityData.group1.term.toLowerCase();
    if (termLower.includes('daily')) return "daily";
    if (termLower.includes('weekly')) return "weekly";
    return "monthly";
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">      
      {/* Personal Information Card - Compact */}
      <Card className="overflow-hidden shadow-lg mb-4">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Name and NIC */}
          <div className="bg-gray-800 p-3 md:w-1/4">
            <h2 className="text-xl text-gray-100">{personalInfo.name}</h2>
            <p className="text-sm text-gray-300">NIC | {personalInfo.nic}</p>
          </div>
          
          {/* Right side - Other personal info */}
          <div className="p-3 flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Gender</span>
                <p className="font-medium">{personalInfo.gender}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Civil Status</span>
                <p className="font-medium">{personalInfo.civilStatus}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">DOB</span>
                <p className="font-medium">{personalInfo.dob}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Mobile</span>
                <p className="font-medium">{personalInfo.mobile}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Address</span>
                <p className="font-medium">{personalInfo.address}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Product</span>
                <p className="font-medium">{personalInfo.product}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Product Type</span>
                <p className="font-medium">{personalInfo.productType}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Location</span>
                <p className="font-medium">{personalInfo.location}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Loan Summary Dashboard */}
      <div className="mb-4">
        <LoanSummaryDashboard
          facilityAmount={parseAmount(facilityData.group1.facilityAmount)}
          paidAmount={parseAmount(facilityData.group2.paidRentalAmount)}
          outstandingBalance={parseAmount(facilityData.group2.totalOutstanding)}
          arrears={Math.max(0, parseAmount(facilityData.group2.totalArrears))}
          dueRentals={parseInt(facilityData.group2.dueRentals)}
          paidRentals={parseInt(facilityData.group2.paidRentals)}
          interest={parseAmount(facilityData.group3.totalInterest)}
          capital={parseAmount(facilityData.group3.capitalAmount)}
          contractStatus={facilityData.group1.contractStatus}
          lastPaymentDate={facilityData.group2.lastPaymentDate}
          nextDueDate={facilityData.group1.dueDate}
          contractNumber={facilityData.group1.contractNo}
        />
      </div>
      
      {/* Facility Details - Three Horizontal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Card 1 */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Contract Details</h2>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Contract No</span>
                <p className="font-medium">{facilityData.group1.contractNo}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Contract Date</span>
                <p className="font-medium">{facilityData.group1.contractDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Facility Amount</span>
                <p className="font-medium">LKR {facilityData.group1.facilityAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Term</span>
                <p className="font-medium">{facilityData.group1.term}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Date</span>
                <p className="font-medium">{facilityData.group1.dueDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Contract Status</span>
                <p className="font-medium text-green-600 bg-green-100 px-1 rounded">{facilityData.group1.contractStatus}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Rental</span>
                <p className="font-medium">LKR {facilityData.group1.rental}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Agreed Amount</span>
                <p className="font-medium">LKR {facilityData.group1.agreedAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Arrears Age</span>
                <p className="font-medium">{facilityData.group1.arrearsAge}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Date</span>
                <p className="font-medium">{facilityData.group1.dueDate2}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Card 2 - Payment Details with Make Payment button */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Payment Details</h2>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Last Payment Date</span>
                <p className="font-medium">{facilityData.group2.lastPaymentDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Last Paid Amount</span>
                <p className="font-medium bg-yellow-100 px-1 rounded">LKR {facilityData.group2.lastPaidAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Arrears</span>
                <p className="font-medium">LKR {facilityData.group2.totalArrears}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Rentals</span>
                <p className="font-medium bg-blue-100 px-1 rounded">{facilityData.group2.paidRentals}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Rentals</span>
                <p className="font-medium bg-blue-100 px-1 rounded">{facilityData.group2.dueRentals}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Outstanding</span>
                <p className="font-medium text-red-600 bg-red-100 px-1 rounded">LKR {facilityData.group2.totalOutstanding}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Default Interest</span>
                <p className="font-medium">LKR {facilityData.group2.defaultInterest}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Rental Amount</span>
                <p className="font-medium">LKR {facilityData.group2.paidRentalAmount}</p>
              </div>
            </div>
            
            {/* Make Payment Button */}
            <div className="mt-3 flex justify-end">
              <button 
                onClick={handleOpenPaymentModal}
                className="text-sm px-3 py-1 rounded text-white font-medium bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 transition-all shadow-md"
              >
                Make Payment
              </button>
            </div>
          </div>
        </Card>
        
        {/* Card 3 - Settlement Details */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Settlement Details</h2>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Settlement Amount</span>
                <p className="font-medium bg-red-100 px-1 rounded">LKR {facilityData.group3.settlementAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Future Capital</span>
                <p className="font-medium bg-purple-100 px-1 rounded">LKR {facilityData.group3.futureCapital}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Future Interest</span>
                <p className="font-medium bg-purple-100 px-1 rounded">LKR {facilityData.group3.futureInterest}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Closing Date</span>
                <p className="font-medium">{facilityData.group3.closingDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Capital</span>
                <p className="font-medium">LKR {facilityData.group3.paidCapital}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Interest</span>
                <p className="font-medium">LKR {facilityData.group3.paidInterest}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Capital Amount</span>
                <p className="font-medium">LKR {facilityData.group3.capitalAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Interest</span>
                <p className="font-medium">LKR {facilityData.group3.totalInterest}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Arrears Calculation Component */}
      <div className="mb-4">
        <ArrearsCalculation 
          frequency={getPaymentFrequency()}
          startDate={facilityData.group1.contractDate}
          dueAmount={getRentalAmount(facilityData.group1.rental)}
          lastPaidDate={facilityData.group2.lastPaymentDate}
        />
      </div>
      
      {/* Tabs for Transaction, Comments, Evaluation, etc. */}
      <Tabs defaultValue="transaction" className="mb-4">
        <TabsList className="bg-white shadow rounded-md border border-gray-200">
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="transaction"
          >
            Transaction
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="comments"
          >
            Comments
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="evaluation"
          >
            Evaluation
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="pastRecords"
          >
            Past Records
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="reminders"
          >
            Reminders
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="paymentSchedule"
          >
            Payment Schedule
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
            value="receipting"
          >
            Receipting
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transaction">
          <TransactionHistoryTable 
            transactions={transactions} 
            onGenerateStatement={handleGenerateStatement}
            showGenerateStatement={true}
          />
        </TabsContent>
        
        <TabsContent value="comments">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Comments</h3>
            
            {/* Previous Comments Section */}
            {comments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm text-gray-500 mb-2">Previous Comments</h4>
                <div className="space-y-3">
                  {comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.date} at {comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Comment Input */}
            <div className="mt-3">
              <h4 className="text-sm text-gray-500 mb-2">Add New Comment</h4>
              <textarea 
                className="w-full h-24 border rounded p-2" 
                placeholder="Add your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button 
                className="text-sm px-3 py-1 rounded text-white font-medium bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 transition-all shadow-md"
                onClick={handleAddComment}
              >
                Save Comment
              </button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluation">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Evaluation</h3>
            <p className="text-gray-500 text-sm">No evaluation data available.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="pastRecords">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Past Records</h3>
            <p className="text-gray-500 text-sm">No past records available.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="reminders">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Reminders</h3>
            <p className="text-gray-500 text-sm">No reminders available.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="paymentSchedule">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Payment Schedule</h3>
            <p className="text-gray-500 text-sm">No payment schedule data available.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="receipting">
          <Card className="p-4">
            {showReceipt && receiptData ? (
              <ReceiptGenerator
                receiptNo={receiptData.receiptNo}
                payerName={receiptData.payerName}
                date={receiptData.date}
                amount={receiptData.amount}
                rentalNo={receiptData.rentalNo}
                capital={receiptData.capital}
                interest={receiptData.interest}
                arrears={receiptData.arrears}
                officerName={receiptData.officerName}
              />
            ) : (
              <>
                <h3 className="font-medium mb-2">Receipting</h3>
                <p className="text-gray-500 text-sm">No active receipt. Make a payment to generate a receipt.</p>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Payment Modal */}
      <PaymentPopupCard
        open={isPaymentModalOpen}
        onClose={handlePaymentSubmit}
        rentalAmount={getRentalAmount(facilityData.group1.rental)}
        arrearsAmount={Math.max(0, parseAmount(facilityData.group2.totalArrears))}
        contractNo={facilityData.group1.contractNo}
        borrowerName={personalInfo.name}
      />
    </div>
  );
}
