"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InstallmentPage() {
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

  // Facility Details from Excel - grouped as they appear in Excel
  const facilityGroup1 = {
    contractNo: "JEMBL0000500",
    contractDate: "01.10.2024",
    facilityAmount: "50000",
    term: "12 Weekly",
    dueDate: "05.10.2024",
    contractStatus: "Active",
    rental: "5291 Weekly",
    agreedAmount: "0",
    arrearsAge: "-0.01",
    dueDate2: "05.10.2024"
  };
  
  const facilityGroup2 = {
    lastPaymentDate: "05.10.2024",
    lastPaidAmount: "5300",
    totalArrears: "-8.33",
    paidRentals: "10",
    dueRentals: "2",
    totalOutstanding: "13540",
    defaultInterest: "0",
    paidRentalAmount: "51460"
  };
  
  const facilityGroup3 = {
    settlementAmount: "13540",
    futureCapital: "10000",
    futureInterest: "3540",
    closingDate: "05.11.2024",
    paidCapital: "0",
    paidInterest: "0",
    facilityAmount2: "50000",
    capitalAmount: "50000",
    totalInterest: "13500"
  };

  // Transaction Details from Excel
  const transactions = [
    {
      receiptNo: "JEREN000100",
      location: "JE",
      date: "05.10.2024",
      rentalPaidAmount: "5300",
      type: "PAYMENT",
      description: "Receipt",
      di: "0",
      capitalAmount: "3000",
      interestAmount: "1200",
      arrears: "0",
      age: "0",
      settlement: "13540",
      proceedBy: "lasantha"
    },
    {
      receiptNo: "",
      location: "JE",
      date: "05.10.2024",
      rentalPaidAmount: "5291",
      type: "DUE RENTAL (10)",
      description: "",
      di: "0",
      capitalAmount: "3001",
      interestAmount: "1200",
      arrears: "0",
      age: "0",
      settlement: "",
      proceedBy: ""
    }
  ];

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
      
      {/* Facility Details - Three Horizontal Cards with reduced height */}
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
                <p className="font-medium">{facilityGroup1.contractNo}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Contract Date</span>
                <p className="font-medium">{facilityGroup1.contractDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Facility Amount</span>
                <p className="font-medium">LKR {facilityGroup1.facilityAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Term</span>
                <p className="font-medium">{facilityGroup1.term}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Date</span>
                <p className="font-medium">{facilityGroup1.dueDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Contract Status</span>
                <p className="font-medium text-green-600 bg-green-100 px-1 rounded">{facilityGroup1.contractStatus}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Rental</span>
                <p className="font-medium">LKR {facilityGroup1.rental}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Agreed Amount</span>
                <p className="font-medium">LKR {facilityGroup1.agreedAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Arrears Age</span>
                <p className="font-medium">{facilityGroup1.arrearsAge}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Date</span>
                <p className="font-medium">{facilityGroup1.dueDate2}</p>
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
                <p className="font-medium">{facilityGroup2.lastPaymentDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Last Paid Amount</span>
                <p className="font-medium bg-yellow-100 px-1 rounded">LKR {facilityGroup2.lastPaidAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Arrears</span>
                <p className="font-medium">LKR {facilityGroup2.totalArrears}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Rentals</span>
                <p className="font-medium bg-blue-100 px-1 rounded">{facilityGroup2.paidRentals}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Due Rentals</span>
                <p className="font-medium bg-blue-100 px-1 rounded">{facilityGroup2.dueRentals}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Outstanding</span>
                <p className="font-medium text-red-600 bg-red-100 px-1 rounded">LKR {facilityGroup2.totalOutstanding}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Default Interest</span>
                <p className="font-medium">LKR {facilityGroup2.defaultInterest}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Rental Amount</span>
                <p className="font-medium">LKR {facilityGroup2.paidRentalAmount}</p>
              </div>
            </div>
            
            {/* Make Payment Button */}
            <div className="mt-3 flex justify-end">
              <button className="text-sm px-3 py-1 rounded text-white font-medium bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 transition-all shadow-md">
                Make Payment
              </button>
            </div>
          </div>
        </Card>
        
        {/* Card 3 */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Settlement Details</h2>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Settlement Amount</span>
                <p className="font-medium bg-red-100 px-1 rounded">LKR {facilityGroup3.settlementAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Future Capital</span>
                <p className="font-medium bg-purple-100 px-1 rounded">LKR {facilityGroup3.futureCapital}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Future Interest</span>
                <p className="font-medium bg-purple-100 px-1 rounded">LKR {facilityGroup3.futureInterest}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Closing Date</span>
                <p className="font-medium">{facilityGroup3.closingDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Capital</span>
                <p className="font-medium">LKR {facilityGroup3.paidCapital}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Interest</span>
                <p className="font-medium">LKR {facilityGroup3.paidInterest}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Capital Amount</span>
                <p className="font-medium">LKR {facilityGroup3.capitalAmount}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Interest</span>
                <p className="font-medium">LKR {facilityGroup3.totalInterest}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Tabs for Transaction, Comments, Evaluation, etc. as shown in Excel */}
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
          {/* Transaction Details Card - Without black header bar */}
          <Card className="overflow-hidden shadow-lg">            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">DI</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capital</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arrears</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Settlement</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proceed By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.receiptNo || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.location}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.date}</td>
                      <td className={`px-3 py-2 whitespace-nowrap text-sm ${index === 0 ? "bg-yellow-100" : ""}`}>
                        LKR {transaction.rentalPaidAmount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.type}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.description || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.di}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">LKR {transaction.capitalAmount}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">LKR {transaction.interestAmount}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.arrears}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.age}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                        {transaction.settlement ? `LKR ${transaction.settlement}` : "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.proceedBy || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 flex justify-end">
              <button className="text-sm px-3 py-1 rounded text-white font-medium bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 transition-all shadow-md">
                Generate Statement
              </button>
            </div>
          </Card>
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
            <h3 className="font-medium mb-2">Receipting</h3>
            <p className="text-gray-500 text-sm">No receipting data available.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
