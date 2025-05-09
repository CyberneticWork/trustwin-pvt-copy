// src/app/loan-info/[id]/page.jsx

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, User } from "lucide-react";
import * as React from 'react';

export default function LoanDetailsList({ params }) {
  // Unwrap the params Promise with React.use()
  const unwrappedParams = React.use(params);
  const customerId = unwrappedParams.id;
  
  const [clientData, setClientData] = useState({
    clientName: "",
    clientId: "",
    loans: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/loan-approval/loan-list-by-Cid?id=${customerId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch loan details");
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setClientData(result.data);
        } else {
          setError("No loan details found");
        }
      } catch (err) {
        console.error("Error fetching loan details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (customerId) {
      fetchLoanDetails();
    }
  }, [customerId]);

  // Custom LKR icon component
  const LkrIcon = () => (
    <div className="h-5 w-5 flex items-center justify-center text-green-500 mr-2 font-bold">
      රු
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-3xl mx-auto">
          <h2 className="text-red-800 text-lg font-semibold">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

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
          {clientData.loans.length > 0 ? (
            clientData.loans.map((loan, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Loan Type</p>
                      <p className="font-medium">{loan.loanType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <LkrIcon />
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-medium">{loan.revenueAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Contract Date</p>
                      <p className="font-medium">{loan.applicationDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">CRO</p>
                      <p className="font-medium">{loan.croName}</p>
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
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No loan records found for this client.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
