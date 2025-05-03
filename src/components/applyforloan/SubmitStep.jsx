// components/applyforloan/SubmitStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SubmitStep({ data, onChange }) {
  // Show success dialog when submission is successful
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Submit Loan Application</h2>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 text-sm">
          Please review all the information carefully before submitting your loan application.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="comments" className="flex items-center">
            Additional Comments
          </Label>
          <Textarea
            id="comments"
            value={data.comments || ''}
            onChange={(e) => handleChange('comments', e.target.value)}
            placeholder="Optional: Add any additional information that might help with the approval process"
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            This information will be shared with the loan officer reviewing your application.
          </p>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={isSubmitSuccess} onOpenChange={setIsSubmitSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
              <span>Application Submitted Successfully</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              Your loan application has been successfully submitted. Our team will review your application and contact you shortly.
            </p>
            <div className="bg-slate-50 p-4 rounded-md border">
              <p className="text-sm font-medium">Application Reference</p>
              <p className="text-lg font-bold text-blue-600">{`APP-${Math.floor(100000 + Math.random() * 900000)}`}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
