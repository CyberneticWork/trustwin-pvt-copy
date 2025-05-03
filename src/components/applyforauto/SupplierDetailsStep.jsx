// components/applyforauto/SupplierDetailsStep.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form,
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// Define the form schema
const supplierFormSchema = z.object({
  name: z.string().optional(),
  brNumber: z.string().optional(),
  idNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional()
});

export default function SupplierDetailsStep({ data, onChange, onNestedChange }) {
  // Initialize form
  const form = useForm({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: data.supplier?.name || "",
      brNumber: data.supplier?.brNumber || "",
      idNumber: data.supplier?.idNumber || "",
      accountNumber: data.supplier?.accountNumber || "",
      bankName: data.supplier?.bankName || "",
      branchName: data.supplier?.branchName || ""
    }
  });

  const handleInputChange = (e, field) => {
    const { name, value } = e.target;
    field.onChange(e);
    onNestedChange('supplier', name, value);
  };

  const handleSelectChange = (value, field, name) => {
    field.onChange(value);
    onNestedChange('supplier', name, value);
  };

  const bankOptions = [
    { value: "BankOfCeylon", label: "Bank of Ceylon" },
    { value: "PeoplesBank", label: "People's Bank" },
    { value: "CommercialBank", label: "Commercial Bank" },
    { value: "HNB", label: "Hatton National Bank" },
    { value: "Sampath", label: "Sampath Bank" },
    { value: "NTB", label: "Nations Trust Bank" },
    { value: "DFCC", label: "DFCC Bank" },
    { value: "NDB", label: "NDB Bank" },
    { value: "PanAsia", label: "Pan Asia Bank" },
    { value: "Other", label: "Other" }
  ];

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Supplier Details</h2>
          <p className="text-sm text-gray-500">
            Please provide information about the vehicle supplier/dealer
          </p>
        </div>

        <Alert variant="info" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription className="text-sm">
            The supplier information will be used for payment processing. Ensure all details are accurate to avoid delays in loan disbursement.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Information</CardTitle>
            <CardDescription>
              Enter details of the dealer or individual supplying the vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier/Dealer Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleInputChange(e, field)} 
                        placeholder="Enter supplier or dealer's name" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Registration Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleInputChange(e, field)} 
                        placeholder="BR Number (if applicable)" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier NIC/ID</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleInputChange(e, field)} 
                        placeholder="National ID Number" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Required for individual sellers or dealer representatives
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Information</CardTitle>
            <CardDescription>
              Enter bank account details for loan disbursement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleInputChange(e, field)} 
                        placeholder="Bank account number" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <Select 
                      onValueChange={(value) => handleSelectChange(value, field, "bankName")}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleInputChange(e, field)} 
                        placeholder="Branch name" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
