"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, User } from "lucide-react";

export default function LoanDetailsList() {
  // Sample loan details data for one client
  const clientData = {
    clientName: "Shalitha Madhuwantha",
    clientId: "C-1234",
    loans: [
      {
        type: "Equipment Loan",
        amount: "LKR 2,450,000",
        contractDate: "Feb 15, 2025",
        cro: "Avishka Avishka"
      }
    ]
  };

  // Custom LKR icon component
  const LkrIcon = () => (
    <div className="h-5 w-5 flex items-center justify-center text-green-500 mr-2 font-bold">
      රු
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-6">      
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Loan Details
      </h1>
      
      {/* Client Loan Card */}
      <Card className="overflow-hidden shadow-lg">
        {/* Client Header with ash background */}
        <div className="p-4 border-b border-gray-200 bg-gray-800">
          <h2 className="text-3xl text-white">{clientData.clientName}</h2>
          <p className="text-md text-gray-300">Client ID | {clientData.clientId}</p>
        </div>
        
        {/* Loan Details List */}
        <div className="divide-y divide-gray-200">
          {clientData.loans.map((loan, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Loan Type</p>
                    <p className="font-medium">{loan.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <LkrIcon />
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-medium">{loan.amount}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Contract Date</p>
                    <p className="font-medium">{loan.contractDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">CRO</p>
                    <p className="font-medium">{loan.cro}</p>
                  </div>
                </div>
              </div>
              
              {/* View Details Button in a better position */}
              <div className="mt-5 flex justify-end">
                <button className="text-sm px-4 py-2 rounded text-white font-medium bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 transition-all shadow-md">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
