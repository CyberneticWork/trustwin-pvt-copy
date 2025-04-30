// components/applyforloan/SubmitStep.jsx
"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckSquare, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function SubmitStep({ data, onChange }) {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  
  // Show success dialog when submission is successful
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  
  // Track validation errors
  const [errors, setErrors] = useState({
    agreeToTerms: '',
  });

  // Validate on initial render and when data changes
  useEffect(() => {
    validateForm();
  }, [data.agreeToTerms]);

  const validateForm = () => {
    const newErrors = {
      agreeToTerms: '',
    };

    if (!data.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return Object.values(newErrors).every(error => error === '');
  };

  const handleChange = (field, value) => {
    onChange(field, value);
    
    // Clear error when field is edited
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Mock terms and conditions content
  const termsAndConditionsContent = `
    # Terms and Conditions

    ## 1. ACCEPTANCE OF TERMS
    By applying for this loan, you agree to be bound by these Terms and Conditions.

    ## 2. ELIGIBILITY
    To be eligible for this loan, you must:
    - Be at least 18 years of age
    - Be a citizen or permanent resident of Sri Lanka
    - Have a valid National ID
    - Have a regular source of income
    - Meet our credit assessment criteria

    ## 3. LOAN APPROVAL
    The approval of your loan application is subject to:
    - Verification of the information provided
    - Credit assessment by our team
    - Availability of funds

    ## 4. REPAYMENT
    - You agree to repay the loan amount plus interest according to the repayment schedule
    - Payments must be made on or before the due dates
    - Early repayment options are available subject to terms

    ## 5. DEFAULT
    In the event of default:
    - Late payment fees will apply
    - Your credit rating may be affected
    - Legal action may be taken to recover the debt

    ## 6. PRIVACY
    Your personal information will be handled in accordance with our Privacy Policy.
  `;

  // Mock privacy policy content
  const privacyPolicyContent = `
    # Privacy Policy

    ## 1. INFORMATION COLLECTION
    We collect personal information including but not limited to:
    - Name, address, and contact details
    - National ID number
    - Employment and income details
    - Financial information
    - Information about your guarantors

    ## 2. USE OF INFORMATION
    We use your information to:
    - Process your loan application
    - Assess your creditworthiness
    - Communicate with you about your loan
    - Comply with legal and regulatory requirements

    ## 3. INFORMATION SHARING
    We may share your information with:
    - Credit reference agencies
    - Legal and regulatory authorities
    - Third-party service providers
    - Collection agencies (in case of default)

    ## 4. DATA SECURITY
    We implement appropriate technical and organizational measures to protect your personal information.

    ## 5. YOUR RIGHTS
    You have the right to:
    - Access your personal information
    - Request correction of inaccurate information
    - Request deletion of your information (subject to legal constraints)
    - Lodge a complaint with the relevant data protection authority
  `;

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

        {/* Terms and Conditions */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-md font-medium">Terms and Agreements</h3>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={data.agreeToTerms || false}
              onCheckedChange={(checked) => handleChange('agreeToTerms', checked)}
            />
            <div className="space-y-1">
              <label 
                htmlFor="agreeToTerms" 
                className={cn(
                  "text-sm leading-tight cursor-pointer",
                  errors.agreeToTerms ? "text-red-500" : "text-gray-700"
                )}
              >
                I confirm that I have read and agree to the <button 
                  type="button" 
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => setIsTermsDialogOpen(true)}
                >Terms & Conditions</button> and <button 
                  type="button" 
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => setIsPrivacyDialogOpen(true)}
                >Privacy Policy</button>, and certify that all information provided is accurate and complete.
              </label>
              {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 bg-slate-50 p-4 rounded-md border">
            <div className="flex items-start space-x-2">
              <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                I understand that providing false or misleading information may result in the rejection of my application and could be considered fraud.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                I authorize the lender to verify any information provided, including contacting employers, banks, and references.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                I understand that submitting this application does not guarantee approval, and the final loan terms may differ based on the assessment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Dialog */}
      <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={() => setIsTermsDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            {termsAndConditionsContent.split('\n\n').map((paragraph, index) => (
              <div key={index} className="prose max-w-none">
                {paragraph.startsWith('# ') ? (
                  <h2 className="text-xl font-bold">{paragraph.replace('# ', '')}</h2>
                ) : paragraph.startsWith('## ') ? (
                  <h3 className="text-lg font-semibold">{paragraph.replace('## ', '')}</h3>
                ) : paragraph.includes('- ') ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {paragraph.split('\n- ').map((item, i) => (
                      <li key={i} className="text-sm">
                        {i === 0 ? item : item.trim()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">{paragraph}</p>
                )}
              </div>
            ))}
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={() => setIsPrivacyDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            {privacyPolicyContent.split('\n\n').map((paragraph, index) => (
              <div key={index} className="prose max-w-none">
                {paragraph.startsWith('# ') ? (
                  <h2 className="text-xl font-bold">{paragraph.replace('# ', '')}</h2>
                ) : paragraph.startsWith('## ') ? (
                  <h3 className="text-lg font-semibold">{paragraph.replace('## ', '')}</h3>
                ) : paragraph.includes('- ') ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {paragraph.split('\n- ').map((item, i) => (
                      <li key={i} className="text-sm">
                        {i === 0 ? item : item.trim()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">{paragraph}</p>
                )}
              </div>
            ))}
          </DialogDescription>
        </DialogContent>
      </Dialog>

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
