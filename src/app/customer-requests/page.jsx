"use client";

import { useState, useEffect } from "react";
import CustomerRequestTable from "@/components/customer-requests/CustomerRequestTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  RefreshCw, 
  ClipboardList, 
  ChevronRight 
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function RequestsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For triggering refresh

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/requesthandel/getnm");
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === "SUCCESS") {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while loading data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Effect for initial load and refreshes
  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Processing data for summary stats
  const pendingCount = data.filter(item => item.status === "Pending").length;
  const approvedCount = data.filter(item => item.status === "Approved").length;
  const rejectedCount = data.filter(item => item.status === "Rejected").length;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/requests" className="font-medium">
              Customer Requests
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ClipboardList className="mr-2 h-6 w-6" />
            Customer Update Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Review and manage customer information update requests
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2 self-start sm:self-auto"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {!isLoading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-4"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      ) : data.length > 0 ? (
        <CustomerRequestTable data={data} />
      ) : !error ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            There are currently no customer update requests to display.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// Summary Card Component
const SummaryCard = ({ title, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colors = {
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
      progress: "bg-yellow-500",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
      progress: "bg-green-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-200",
      progress: "bg-red-500",
    },
  };
  
  const style = colors[color] || colors.yellow;
  
  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-medium ${style.text}`}>{title}</h3>
        <span className={`text-lg font-semibold ${style.text}`}>{value}</span>
      </div>
      <div className="bg-white rounded-full h-2 overflow-hidden">
        <div 
          className={`${style.progress} h-full rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{percentage}% of total requests</p>
    </div>
  );
};