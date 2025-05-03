// components/applyforauto/PaymentDetailsStep.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody,
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Define the form schema for validation
const paymentFormSchema = z.object({});

export default function PaymentDetailsStep({ data, onChange, onNestedChange }) {
  // Create a form instance with minimal setup since we're just displaying data
  const form = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {}
  });

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Calculate loan base amount
  const baseAmount = (parseFloat(data.vehicle?.valuationAmount || 0) - 
                    parseFloat(data.vehicle?.downPayment || 0)).toFixed(2);

  // Get final loan amount with capitalized charges
  const finalLoanAmount = data.payments?.finalLoanAmount || baseAmount;

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
          <p className="text-sm text-gray-500">
            Review payment information and charges for this auto loan
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loan Summary</CardTitle>
            <CardDescription>
              Basic loan information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border p-3 rounded-md bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">Vehicle Valuation</div>
                <div className="font-semibold">
                  {formatCurrency(data.vehicle?.valuationAmount)}
                </div>
              </div>
              
              <div className="border p-3 rounded-md bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">Down Payment</div>
                <div className="font-semibold">
                  {formatCurrency(data.vehicle?.downPayment)}
                </div>
              </div>
              
              <div className="border p-3 rounded-md bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">Loan Period</div>
                <div className="font-semibold">
                  {data.period} {data.periodType}
                </div>
              </div>
              
              <div className="border p-3 rounded-md bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">IRR Rate</div>
                <div className="font-semibold">
                  {data.irrRate ? `${data.irrRate}%` : 'Not specified'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Initial Charges</CardTitle>
            <CardDescription>
              Charges associated with this loan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Charge Type</TableHead>
                  <TableHead className="w-[40%]">Amount (LKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Service Charges</TableCell>
                  <TableCell>{formatCurrency(data.payments?.serviceCharges)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Documentation Charges</TableCell>
                  <TableCell>{formatCurrency(data.payments?.documentationCharges)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">RMV Charges</TableCell>
                  <TableCell>{formatCurrency(data.payments?.rmvCharges)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Insurance Premium</TableCell>
                  <TableCell>{formatCurrency(data.payments?.insuranceCharges)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Introducer Commission</TableCell>
                  <TableCell>{formatCurrency(data.payments?.introducerCommission)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Other Charges</TableCell>
                  <TableCell>{formatCurrency(data.payments?.otherCharges)}</TableCell>
                </TableRow>

                <TableRow className="bg-gray-50">
                  <TableCell className="font-bold">Total Charges</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(data.payments?.totalCharges)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4 p-3 bg-gray-50 border rounded-md">
              <p className="text-sm font-medium">Customer will pay initial charge as: <span className="font-semibold">client pays separately</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Final Loan Amount</CardTitle>
            <CardDescription>
              The total loan amount including capitalized charges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Base Amount (Valuation - Down Payment)</div>
                  <div className="font-semibold text-2xl">
                    {formatCurrency(baseAmount)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Final Loan Amount (with capitalized charges)</div>
                  <div className="font-semibold text-2xl text-blue-700">
                    {formatCurrency(finalLoanAmount)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p className="mb-1">* Capitalized charges are added to the loan principal and financed over the loan term.</p>
                <p>* Non-capitalized charges must be paid upfront.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
