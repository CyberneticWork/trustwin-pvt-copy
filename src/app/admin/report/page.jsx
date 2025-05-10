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
  RefreshCw, 
  ChevronDown 
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportPage() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [branch, setBranch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format date or send null for 'all'
  const formatDateOrNull = (date) => 
    date ? date.toISOString().split("T")[0] : null;

  // Main fetchData function
  const fetchData = async (opts = {}) => {
    const {
      from = fromDate,
      to = toDate,
      branchId = branch,
      showAlert = true
    } = opts;

    // Input validation
    if ((from || to) && (!from || !to) && showAlert) {
      alert("Please select both From Date and To Date, or leave both empty for all dates.");
      return;
    }
    if (!branchId && showAlert) {
      alert("Please select a branch or 'All Branches'.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fromDate: from === 'all' ? null : formatDateOrNull(from),
        toDate: to === 'all' ? null : formatDateOrNull(to),
        branch: branchId === 'all' ? null : branchId,
      };
      
      const response = await fetch("/api/report/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  // Download combinations options
  const downloadCombinations = [
    {
      label: "All Dates, All Branches",
      handler: () => fetchData({ from: null, to: null, branchId: 'all', showAlert: false })
    },
    {
      label: "Selected Dates, All Branches",
      handler: () => fetchData({ from: fromDate, to: toDate, branchId: 'all', showAlert: false })
    },
    {
      label: "All Dates, Selected Branch",
      handler: () => fetchData({ from: null, to: null, branchId: branch, showAlert: false })
    },
  ];

  // Custom date picker component with styling
  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <div 
      className="flex items-center border rounded-md p-2 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
      <span className={`${!value ? "text-gray-400" : "text-gray-700"}`}>
        {value || placeholder}
      </span>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen bg-gray-50">
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Sales Report Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Generate and download detailed sales reports
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
              {data.length > 0 ? `${data.length} records found` : "No data loaded"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          {/* Filters Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-blue-600" />
              Filter Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  customInput={<CustomDateInput placeholder="Select start date" />}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  customInput={<CustomDateInput placeholder="Select end date" />}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <Select value={branch} onValueChange={(value) => setBranch(value)}>
                  <SelectTrigger className="w-full border-gray-200 focus:ring-blue-500">
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
                  onClick={() => fetchData()} 
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
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h3 className="text-md font-semibold text-gray-700">
              {data.length > 0 
                ? `Report Data (${data.length} records)` 
                : "No data available - apply filters to load data"}
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {data.length > 0 && (
                <Button 
                  onClick={downloadExcel} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Current Data
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    Quick Reports
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {downloadCombinations.map((option, idx) => (
                    <DropdownMenuItem 
                      key={idx} 
                      onClick={option.handler}
                      disabled={loading}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Table Section */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">CRO ID</TableHead>
                  <TableHead className="font-semibold">Branch</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold">Loan Type</TableHead>
                  <TableHead className="font-semibold">Loan Amount</TableHead>
                  <TableHead className="font-semibold">Paid Amount</TableHead>
                  <TableHead className="font-semibold">Contract Date</TableHead>
                  <TableHead className="font-semibold">Last Payment</TableHead>
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">{row.CROId}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>
                        <div className="font-medium">{row.customerName}</div>
                        <div className="text-xs text-gray-500">ID: {row.customerId}</div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{row.customerAddress}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {row.loanType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${row.loanAmount}</TableCell>
                      <TableCell className="text-green-600">${row.payedAmount}</TableCell>
                      <TableCell>{new Date(row.contractDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(row.lastPaymentDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No data available. Apply filters and click "Load Data" to view results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile optimized data view (for very small screens) */}
          <div className="md:hidden mt-6 space-y-4">
            {data.length > 0 && !loading ? (
              data.map((row, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <Badge variant="outline">{row.branch}</Badge>
                      <span className="text-sm text-gray-500">CRO ID: {row.CROId}</span>
                    </div>
                    <h4 className="font-medium">{row.customerName}</h4>
                    <p className="text-sm text-gray-600 truncate">{row.customerAddress}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Type:</span>
                        <p>{row.loanType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <p className="font-medium">${row.loanAmount}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid Amount:</span>
                        <p className="text-green-600">${row.payedAmount}</p>
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
              // Mobile loading state
              Array(3).fill(0).map((_, index) => (
                <Card key={`mobile-skeleton-${index}`} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
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
          
          {/* Export buttons (bottom) */}
          {data.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                onClick={downloadExcel} 
                className="bg-green-600 hover:bg-green-700"
              >
                {/* <DownloadIcon className="h-4 w-4 mr-2" /> */}
                Export to Excel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}