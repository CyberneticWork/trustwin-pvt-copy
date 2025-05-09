// components/finance-approval/status-check.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, CheckCircle, Search, Database } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StatusCheck() {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fixingStatus, setFixingStatus] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  // Function to check database status values
  const checkStatuses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/finance-approval/debug');
      
      if (!response.ok) {
        throw new Error('Failed to fetch status information');
      }
      
      const data = await response.json();
      setStatusData(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error checking statuses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fix the status values
  const fixStatuses = async () => {
    if (!confirm("This will update all database records with 'fund waiting' status variations to the correct format. Continue?")) {
      return;
    }
    
    setFixingStatus(true);
    setError(null);
    
    try {
      // Create a simple API endpoint to fix the statuses
      const response = await fetch('/api/finance-approval/fix-status', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fix status values');
      }
      
      const data = await response.json();
      setFixResult(data);
      
      // Refresh the status data
      checkStatuses();
    } catch (err) {
      setError(err.message);
      console.error('Error fixing statuses:', err);
    } finally {
      setFixingStatus(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-lg flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Database Status Check
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Check for status inconsistencies</Label>
              <p className="text-sm text-muted-foreground">
                Examine database status values to identify potential issues with "fund waiting" status
              </p>
            </div>
            <Button 
              onClick={checkStatuses} 
              disabled={isLoading}
              size="sm"
              className="flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Checking...' : 'Check Status Values'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {statusData && (
            <>
              <Separator className="my-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <StatusSection 
                  title="Auto Loan Statuses"
                  data={statusData.autoLoanStatuses}
                  targetStatus="fund waiting"
                />
                
                <StatusSection 
                  title="Equipment Loan Statuses"
                  data={statusData.equipmentLoanStatuses}
                  targetStatus="fund waiting"
                />
                
                <StatusSection 
                  title="Business Loan Statuses"
                  data={statusData.businessLoanStatuses}
                  targetStatus="fund waiting"
                />
              </div>
              
              <div className="mt-6 bg-amber-50 p-4 rounded-md border border-amber-200">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-amber-800">Analysis</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {hasFundWaitingStatus(statusData) ? (
                        "Status 'fund waiting' exists in the database but may have inconsistencies. Check for exact case matching and whitespace issues."
                      ) : (
                        "Status 'fund waiting' was not found in one or more loan tables. This will prevent loans from appearing in the fund requests table."
                      )}
                    </p>
                    
                    {statusData && (
                      <div className="mt-3">
                        <Button
                          onClick={fixStatuses}
                          disabled={fixingStatus}
                          variant="outline"
                          size="sm"
                          className="bg-white"
                        >
                          {fixingStatus ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          {fixingStatus ? 'Fixing...' : 'Fix Status Values'}
                        </Button>
                        <p className="text-xs text-amber-600 mt-2">
                          This will standardize all variations of "fund waiting" status to the correct format.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {fixResult && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">Status Fix Applied</AlertTitle>
                  <AlertDescription className="text-green-600">
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Auto loans updated: {fixResult.data.autoLoansUpdated}</li>
                      <li>Equipment loans updated: {fixResult.data.equipmentLoansUpdated}</li>
                      <li>Business loans updated: {fixResult.data.businessLoansUpdated}</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 text-xs text-slate-500">
        This tool helps diagnose issues with loan statuses in the database. No data is modified unless "Fix Status Values" is clicked.
      </CardFooter>
    </Card>
  );
}

// Helper component for status sections
function StatusSection({ title, data, targetStatus }) {
  if (!data || data.length === 0) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-medium text-sm mb-2">{title}</h3>
        <p className="text-sm text-gray-500 italic">No status data available</p>
      </div>
    );
  }

  const hasTargetStatus = data.some(item => item.status === targetStatus);
  
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-sm mb-2 flex items-center justify-between">
        {title}
        {hasTargetStatus ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Found
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Missing
          </Badge>
        )}
      </h3>
      
      <ul className="space-y-1 mt-3">
        {data.map((item, index) => (
          <li key={index} className="flex items-center text-sm">
            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs mr-2 flex-1 truncate">
              "{item.status}"
            </span>
            
            {item.status === targetStatus ? (
              <Badge className="bg-green-100 text-green-800">Match</Badge>
            ) : item.status && item.status.toLowerCase().includes("fund") && item.status.toLowerCase().includes("wait") ? (
              <Badge className="bg-yellow-100 text-yellow-800">Similar</Badge>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper function to check if any table has fund waiting status
function hasFundWaitingStatus(statusData) {
  if (!statusData) return false;
  
  const autoHasStatus = statusData.autoLoanStatuses?.some(item => 
    item.status === 'fund waiting' || 
    (item.status && item.status.toLowerCase().includes('fund') && item.status.toLowerCase().includes('wait'))
  );
  
  const equipmentHasStatus = statusData.equipmentLoanStatuses?.some(item => 
    item.status === 'fund waiting' || 
    (item.status && item.status.toLowerCase().includes('fund') && item.status.toLowerCase().includes('wait'))
  );
  
  const businessHasStatus = statusData.businessLoanStatuses?.some(item => 
    item.status === 'fund waiting' || 
    (item.status && item.status.toLowerCase().includes('fund') && item.status.toLowerCase().includes('wait'))
  );
  
  return autoHasStatus || equipmentHasStatus || businessHasStatus;
}
