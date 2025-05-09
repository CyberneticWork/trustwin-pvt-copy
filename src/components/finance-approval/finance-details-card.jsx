// components/finance-approval/finance-details-card.jsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

export default function FinanceDetailsCard({ loan, onClose, onApprove, onReject, isLoading }) {
  // State for comment
  const [comment, setComment] = useState("");
  
  // State for validation errors
  const [errorMessage, setErrorMessage] = useState("");

  // Check if this loan is waiting for fund approval
  const canApprove = loan.status === "Waiting for Funds";

  // Check if details are still loading
  if (loan.loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if there was an error loading details
  if (loan.error) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">Error loading loan details: {loan.error}</p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  // Handle approval with validation
  const handleApprove = () => {
    if (!comment.trim()) {
      setErrorMessage("Please add a comment before approving funding.");
      return;
    }
    setErrorMessage("");
    onApprove(loan.id, comment);
  };

  // Handle rejection with validation
  const handleReject = () => {
    if (!comment.trim()) {
      setErrorMessage("Please add a comment before rejecting funding.");
      return;
    }
    setErrorMessage("");
    onReject(loan.id, comment);
  };

  return (
    <div className="p-2 max-h-[70vh] overflow-y-auto">
      {/* Basic loan information */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Loan ID</p>
          <p className="font-medium">{loan.id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Contract ID</p>
          <p className="font-medium">{loan.contractId || `CT-${4590 + parseInt(loan.id.substring(2))}`}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-medium">{loan.customerName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <Badge className="bg-blue-100 text-blue-800">
            {loan.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500">Loan Type</p>
          <p className="font-medium">{loan.loanType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium">{loan.revenueAmount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">CRO</p>
          <p className="font-medium">{loan.croName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Application Date</p>
          <p className="font-medium">{loan.applicationDate}</p>
        </div>
      </div>

      {/* Additional details if available */}
      {loan.details && (
        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">Additional Details</h3>

          {/* Customer Details */}
          {loan.details.customer && (
            <div className="border rounded-md p-3 mb-3 space-y-2">
              <h4 className="font-medium text-sm">Customer Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p>{loan.details.customer.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIC</p>
                  <p>{loan.details.customer.nic}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p>{loan.details.customer.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p>{loan.details.customer.telNo}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p>{loan.details.customer.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details - Added section */}
          {loan.details.bank && (
            <div className="border rounded-md p-3 mb-3 space-y-2">
              <h4 className="font-medium text-sm">Bank Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Account Type</p>
                  <p>{loan.details.bank.acctype}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bank Name</p>
                  <p>{loan.details.bank.bank}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Number</p>
                  <p>{loan.details.bank.acno}</p>
                </div>
                <div>
                  <p className="text-gray-500">Branch</p>
                  <p>{loan.details.bank.branch}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loan Details */}
          {loan.details.loan && (
            <div className="border rounded-md p-3 mb-3 space-y-2">
              <h4 className="font-medium text-sm">Loan Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {loan.id.startsWith("A") ? (
                  <>
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p>LKR {Number(loan.details.loan.loan_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Term (Months)</p>
                      <p>{loan.details.loan.loan_term_months}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interest Rate</p>
                      <p>{loan.details.loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly Payment</p>
                      <p>LKR {Number(loan.details.loan.monthly_payment).toLocaleString()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p>LKR {Number(loan.details.loan.loanAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Term</p>
                      <p>{loan.details.loan.term}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interest Rate</p>
                      <p>{loan.details.loan.rate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Installment</p>
                      <p>LKR {Number(loan.details.loan.Installment).toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message display */}
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {errorMessage}
        </div>
      )}
      
      {/* Comment Section */}
      <div className="mt-4">
        <h4 className="font-medium text-sm mb-2">Comment <span className="text-gray-500">(Required)</span></h4>
        <Textarea
          placeholder="Add your funding approval/rejection comments here..."
          className="resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-end space-x-2">
        {canApprove && (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-t-2 border-b-2 rounded-full animate-spin mr-2" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject Funding
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApprove}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-t-2 border-b-2 rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve Funding
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
