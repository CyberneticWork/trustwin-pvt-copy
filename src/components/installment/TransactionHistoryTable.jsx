// components/installment/TransactionHistoryTable.jsx
"use client";

import React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { openPrintBill } from "./printBill";

export default function TransactionHistoryTable({ 
  transactions = [], 
  showGenerateStatement = true,
  onGenerateStatement
}) {
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  const [expandedRow, setExpandedRow] = useState(null);
  
  // If no transactions are provided, display a message
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No transaction history available.</p>
      </Card>
    );
  }
  
  // Sort transactions based on current sort configuration
  const sortedTransactions = [...transactions].sort((a, b) => {
    // Handle date sorting (convert to Date objects)
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortConfig.direction === 'asc' ? 
        dateA - dateB : 
        dateB - dateA;
    }
    
    // Handle numeric values
    if (['amount', 'capital', 'interest', 'arrears'].includes(sortConfig.key)) {
      const valueA = parseFloat(a[sortConfig.key] || 0);
      const valueB = parseFloat(b[sortConfig.key] || 0);
      return sortConfig.direction === 'asc' ? 
        valueA - valueB : 
        valueB - valueA;
    }
    
    // Handle string values
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Request sorting change
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort direction icon
  const getSortDirectionIcon = (name) => {
    if (sortConfig.key !== name) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };
  
  // Toggle row expansion for mobile view
  const toggleRowExpansion = (index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {/* All columns from loan_payments table */}
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('id')}>ID {getSortDirectionIcon('id')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('contractid')}>Contract ID {getSortDirectionIcon('contractid')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('payment_number')}>Payment # {getSortDirectionIcon('payment_number')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('payment_date')}>Payment Date {getSortDirectionIcon('payment_date')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('amount_paid')}>Amount Paid {getSortDirectionIcon('amount_paid')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('payment_method')}>Payment Method {getSortDirectionIcon('payment_method')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('transaction_id')}>Transaction ID {getSortDirectionIcon('transaction_id')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>Status {getSortDirectionIcon('status')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('notes')}>Notes {getSortDirectionIcon('notes')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('setalment')}>Settlement {getSortDirectionIcon('setalment')}</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
              {/* Mobile expand/collapse column */}
              <th scope="col" className="md:hidden px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction, index) => {
              const rowKey = `transaction-${index}-${transaction.receiptNo || 'no-receipt'}-${transaction.date}`;
              const expandedRowKey = `expanded-${rowKey}`;
              
              return (
                <React.Fragment key={rowKey}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.id}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.contractid}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.payment_number}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.payment_date}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">LKR {parseFloat(transaction.amount_paid).toLocaleString()}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.payment_method}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.transaction_id || '-'}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.status}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.notes || '-'}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">LKR {parseFloat(transaction.setalment || 0).toLocaleString()}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                      <Button size="sm" variant="outline" onClick={() => {
                        // Calculate settlement and remaining settlement
                        const amountPaid = parseFloat(transaction.amount_paid || 0);
                        const arrears = parseFloat(transaction.arrears || 0);
                        const rental = parseFloat(transaction.rental || 0);
                        
                        let settlement = 0;
                        let remainingSettlement = 0;
                        let remainingArrears = 0;

                        // Calculate arrears after payment
                        if (amountPaid < arrears) {
                          remainingArrears = arrears - amountPaid;
                        }

                        // Calculate settlement and remaining settlement
                        if (amountPaid > arrears) {
                          const amountForSettlement = amountPaid - arrears;
                          settlement = Math.min(amountForSettlement, rental);
                          remainingSettlement = rental - settlement;
                        } else {
                          remainingSettlement = rental;
                        }

                        // Map DB fields to receipt fields for printBill
                        openPrintBill({
                          receiptNo: transaction.payment_number || transaction.id,
                          paidAt: transaction.payment_date,
                          contractNo: transaction.contractid,
                          borrowerName: transaction.borrowerName || transaction.customerName || '-',
                          paymentMethod: transaction.payment_method,
                          referenceNo: transaction.transaction_id,
                          amount: amountPaid,
                          arrearsAmount: arrears,
                          remainingArrears: remainingArrears,
                          settlement: settlement,
                          remainingSettlement: remainingSettlement,
                          totalAmount: amountPaid
                        });
                      }}>
                        Print
                      </Button>
                    </td>
                    {/* Mobile expand/collapse button */}
                    <td className="md:hidden px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                      <button 
                        onClick={() => toggleRowExpansion(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedRow === index ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded mobile row */}
                  {expandedRow === index && (
                    <tr key={expandedRowKey} className="md:hidden bg-gray-50">
                      <td colSpan="5" className="px-3 py-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium text-gray-500">Capital:</span>
                            <p>LKR {parseFloat(transaction.capital || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Interest:</span>
                            <p>LKR {parseFloat(transaction.interest || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Arrears:</span>
                            <p>{transaction.arrears ? `LKR ${parseFloat(transaction.arrears).toLocaleString()}` : "-"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Officer:</span>
                            <p>{transaction.officer || "-"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Generate Statement Button */}
      {showGenerateStatement && (
        <div className="p-3 flex justify-end">
          <Button 
            onClick={onGenerateStatement} 
            className="text-sm px-3 py-1 rounded text-white font-medium bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 transition-all shadow-md"
          >
            <FileText className="h-4 w-4 mr-1" /> Generate Statement
          </Button>
        </div>
      )}
    </Card>
  );
}
