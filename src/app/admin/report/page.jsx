"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Calendar, 
  Building2, 
  Filter, 
  RefreshCw
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportPage() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [branch, setBranch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format currency to LKR with thousands separators
  const formatLKR = (amount) => {
    return Number(amount).toLocaleString('en', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  // Format date or send null for 'all'
  const formatDateOrNull = (date) => 
    date ? date.toISOString().split("T")[0] : null;

  // Main fetchData function
  const fetchData = async () => {
    if ((fromDate || toDate) && (!fromDate || !toDate)) {
      alert("Please select both From Date and To Date, or leave both empty for all dates.");
      return;
    }
    if (!branch) {
      alert("Please select a branch or 'All Branches'.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/report/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: formatDateOrNull(fromDate),
          toDate: formatDateOrNull(toDate),
          branch: branch === 'all' ? null : branch,
        }),
      });
      
      const result = await response.json();
      if (result.code === "SUCCESS") {
        setData(result.data);
      } else {
        alert(result.message || "Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Export data to Excel
  const downloadExcel = () => {
    const formattedData = data.map(row => ({
      ...row,
      loanAmount: `Rs. ${formatLKR(row.loanAmount)}`,
      payedAmount: `Rs. ${formatLKR(row.payedAmount)}`
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  // Custom date picker component
  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <div 
      className="flex items-center border rounded-md p-2 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
      <span className={`${!value ? "text-gray-400" : "text-gray-700"}`}>
        {value || placeholder}
      </span>
    </div>
  );

  return (
    <div className="p-4 min-h-screen bg-[#F3F4F6]">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Sales Report Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Generate and download sales reports (LKR)
              </CardDescription>
            </div>
            {data.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 self-start sm:self-auto">
                {data.length} records found
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Filter Section */}
          <div className="bg-white p-4 rounded-lg mb-4 border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-blue-600" />
              Filter Options
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  customInput={<CustomDateInput placeholder="Select start date" />}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  customInput={<CustomDateInput placeholder="Select end date" />}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <Select value={branch} onValueChange={(value) => setBranch(value)}>
                  <SelectTrigger className="border-gray-200">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Select Branch" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="1">JE</SelectItem>
                    <SelectItem value="2">NG</SelectItem>
                    <SelectItem value="3">Branch C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={fetchData} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Filter className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Loading..." : "Apply Filters"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
            <h3 className="text-md font-semibold text-gray-700 mb-2 sm:mb-0">
              {data.length > 0 
                ? `Report Data (${data.length} records)` 
                : "No data - apply filters to load"
              }
            </h3>
            
            {data.length > 0 && (
              <Button 
                onClick={downloadExcel} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            )}
          </div>
          
          {/* Table Section with Reduced Column Widths */}
          <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Reduced CRO ID width */}
                  <TableHead className="font-semibold w-12 sm:w-14">CRO ID</TableHead>
                  {/* Reduced Branch width */}
                  <TableHead className="font-semibold w-12 sm:w-16">Branch</TableHead>
                  <TableHead className="font-semibold w-32">Customer</TableHead>
                  {/* Reduced address column width */}
                  <TableHead className="font-semibold w-32 max-w-[150px]">Address</TableHead>
                  <TableHead className="font-semibold w-20">Loan Type</TableHead>
                  <TableHead className="font-semibold w-24">Loan Amount</TableHead>
                  <TableHead className="font-semibold w-24">Paid Amount</TableHead>
                  <TableHead className="font-semibold w-24">Contract Date</TableHead>
                  <TableHead className="font-semibold w-24">Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading state with skeletons
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array(9).fill(0).map((_, cellIndex) => (
                        <TableCell key={`cell-${index}-${cellIndex}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  data.map((row, index) => (
                    <TableRow 
                      key={index}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">{row.CROId}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>
                        <div className="font-medium">{row.customerName}</div>
                        <div className="text-xs text-gray-500">ID: {row.customerId}</div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={row.customerAddress}>
                        {row.customerAddress}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {row.loanType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        Rs. {formatLKR(row.loanAmount)}
                      </TableCell>
                      <TableCell className="text-green-600 whitespace-nowrap">
                        Rs. {formatLKR(row.payedAmount)}
                      </TableCell>
                      <TableCell>{new Date(row.contractDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(row.lastPaymentDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                      No data available. Apply filters to view results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Cards View */}
          <div className="md:hidden mt-4 space-y-3">
            {data.length > 0 && !loading ? (
              data.map((row, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{row.branch}</Badge>
                      <span className="text-sm text-gray-500">CRO: {row.CROId}</span>
                    </div>
                    <h4 className="font-medium">{row.customerName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Type:</span>
                        <p>{row.loanType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <p className="font-medium">Rs. {formatLKR(row.loanAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid Amount:</span>
                        <p className="text-green-600">Rs. {formatLKR(row.payedAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Contract Date:</span>
                        <p>{new Date(row.contractDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : loading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={`mobile-skeleton-${index}`} className="border">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <div className="grid grid-cols-2 gap-2">
                      {Array(4).fill(0).map((_, cellIndex) => (
                        <div key={cellIndex}>
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
