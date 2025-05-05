// components/installment/TransactionHistoryTable.jsx
"use client";

import React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

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
              {/* Always visible columns on all screen sizes */}
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('receiptNo')}
              >
                Receipt No {getSortDirectionIcon('receiptNo')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('date')}
              >
                Date {getSortDirectionIcon('date')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('amount')}
              >
                Amount {getSortDirectionIcon('amount')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('type')}
              >
                Type {getSortDirectionIcon('type')}
              </th>
              
              {/* Columns that hide on mobile but display on larger screens */}
              <th 
                scope="col" 
                className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('capital')}
              >
                Capital {getSortDirectionIcon('capital')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('interest')}
              >
                Interest {getSortDirectionIcon('interest')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('arrears')}
              >
                Arrears {getSortDirectionIcon('arrears')}
              </th>
              <th 
                scope="col" 
                className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('officer')}
              >
                Officer {getSortDirectionIcon('officer')}
              </th>
              
              {/* Mobile expand/collapse column */}
              <th scope="col" className="md:hidden px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction, index) => {
              const rowKey = `transaction-${index}-${transaction.receiptNo || 'no-receipt'}-${transaction.date}`;
              const expandedRowKey = `expanded-${rowKey}`;
              
              return (
                <React.Fragment key={rowKey}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {/* Always visible columns */}
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {transaction.receiptNo || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {transaction.date}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      LKR {parseFloat(transaction.amount).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        transaction.type === "PAYMENT" ? "bg-green-100 text-green-800" :
                        transaction.type === "ARREARS" ? "bg-red-100 text-red-800" : 
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    
                    {/* Columns that hide on mobile */}
                    <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      LKR {parseFloat(transaction.capital || 0).toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      LKR {parseFloat(transaction.interest || 0).toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {transaction.arrears ? `LKR ${parseFloat(transaction.arrears).toLocaleString()}` : "-"}
                    </td>
                    <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {transaction.officer || "-"}
                    </td>
                    
                    {/* Mobile expand/collapse button */}
                    <td className="md:hidden px-3 py-2 whitespace-nowrap text-sm text-gray-700">
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
