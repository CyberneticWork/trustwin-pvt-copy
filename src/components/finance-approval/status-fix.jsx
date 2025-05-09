// components/finance-approval/status-fix.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function StatusFix() {
  const [result, setResult] = useState(null);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState(null);
  
  const fixStatuses = async () => {
    if (!confirm("Are you sure you want to fix all database statuses? This will update any incorrectly formatted 'fund waiting' statuses.")) {
      return;
    }
    
    setIsFixing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/finance-approval/fix-status', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fix statuses');
      }
      
      const data = await response.json();
      setResult(data.data);
      
      if (data.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fixing statuses:', err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-md">Fix Status Values</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          If loan records have incorrect status formats, use this tool to fix them. 
          This will standardize all variations of "fund waiting" status to the correct format.
        </p>
        
        <Button 
          onClick={fixStatuses} 
          disabled={isFixing}
          variant="destructive"
          className="mb-4"
        >
          {isFixing ? 'Fixing...' : 'Fix Status Values'}
        </Button>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-red-600">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        {result && (
          <div className="bg-green-50 p-4 rounded-md flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-green-600">Status Fix Applied</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Auto loans updated: {result.autoLoansUpdated}</li>
                <li>Equipment loans updated: {result.equipmentLoansUpdated}</li>
                <li>Business loans updated: {result.businessLoansUpdated}</li>
              </ul>
              <p className="mt-2 text-sm text-green-600">Page will reload in 2 seconds.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
