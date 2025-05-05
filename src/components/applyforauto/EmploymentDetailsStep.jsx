// components/applyforauto/EmploymentDetailsStep.jsx
"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// Create a schema for form validation
const formSchema = z.object({
  businessOrEmployerName: z.string().optional(),
  businessOrEmploymentPeriod: z.string().optional(),
  businessOrEmployerAddress: z.string().optional(),
  natureOfBusinessOrEmployment: z.string().optional(),
  businessType: z.string().optional(),
  businessRegistrationNo: z.string().optional(),
  employmentType: z.string().optional(),
});

export default function EmploymentDetailsStep({ data, onChange }) {
  const [employmentType, setEmploymentType] = useState(
    data.employmentType
  );

  // Initialize form with the form hook
  useEffect(() => {
    setEmploymentType(data.employmentType);
  }, [data.employmentType]);

  // Initialize form with the form hook
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessOrEmployerName: data.companyName || "",
      businessOrEmploymentPeriod: data.experienceYears || "",
      businessOrEmployerAddress: data.businessAddress || "",
      natureOfBusinessOrEmployment: data.designation || "",
      businessType: data.businessType || "",
      businessRegistrationNo: data.companyRegistrationNumber || "",
      employmentType: data.employmentType || "employee",
    },
  });

  console.log(form.getValues());
  

  const handleEmploymentTypeChange = (value) => {
    console.log(value);
    setEmploymentType(value);
    onChange({ employmentType: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Map form field names to parent component field names
    let fieldName;
    switch (name) {
      case 'businessOrEmployerName':
        fieldName = 'companyName';
        break;
      case 'businessOrEmploymentPeriod':
        fieldName = 'experienceYears';
        break;
      case 'businessOrEmployerAddress':
        fieldName = 'businessAddress';
        break;
      case 'natureOfBusinessOrEmployment':
        fieldName = 'designation';
        break;
      case 'businessRegistrationNo':
        fieldName = employmentType === 'employed' ? 'companyRegistrationNumber' : 'businessRegistrationNo';
        break;
      default:
        fieldName = name;
    }

    onChange(fieldName, value);
    form.setValue(name, value);
  };

  const handleSelectChange = (name, value) => {
    // Map form field names to parent component field names
    let fieldName;
    switch (name) {
      case 'businessType':
        fieldName = 'businessType';
        break;
      default:
        fieldName = name;
    }

    onChange(fieldName, value);
    form.setValue(name, value);
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Employment Details</h2>
          <p className="text-sm text-gray-500">
            Please provide information about your current employment or business
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employment Type</CardTitle>
            <CardDescription>
              Select whether you are employed or run your own business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                name="employmentType"
                value={employmentType}
                onValueChange={handleEmploymentTypeChange}
              >
                {/* handleEmploymentTypeChange(value); */}
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="business">Self-Employed/Business Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {employmentType === "employed" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment Information</CardTitle>
              <CardDescription>
                Provide details about your current employment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessOrEmployerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Your employer's name"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessOrEmploymentPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Period (Years)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="How long have you worked here"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessOrEmployerAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-1 sm:col-span-2">
                      <FormLabel>Employer Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Your employer's address"
                          rows={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="natureOfBusinessOrEmployment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title/Position</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Your job title or position"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSelectChange("businessType", value);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Permanent">Permanent</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Temporary">Temporary</SelectItem>
                          <SelectItem value="PartTime">Part-Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Information</CardTitle>
              <CardDescription>
                Provide details about your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessOrEmployerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Your business name"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessRegistrationNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registration No.</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Business registration number"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessOrEmployerAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-1 sm:col-span-2">
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Business address"
                          rows={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="natureOfBusinessOrEmployment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nature of Business</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          placeholder="Type of business or industry"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessOrEmploymentPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Period (Years)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChange(e);
                          }}
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="How long have you operated this business"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSelectChange("businessType", value);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="LimitedCompany">Limited Company</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Form>
  );
}