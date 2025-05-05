// components/applyforauto/VehicleDetailsStep.jsx
"use client";

import { useState, useRef, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// Define schema for form validation
const vehicleFormSchema = z.object({
  type: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  vehicleNo: z.string().optional(),
  chassisNo: z.string().optional(),
  engineNo: z.string().optional(),
  firstRegDate: z.string().optional(),
  engineCapacity: z.string().optional(),
  yom: z.string().optional(),
  meterReading: z.string().optional(),
  valuationAmount: z.string().optional(),
  valuerName: z.string().optional(),
});
let uploadedFiles = [];

export default function VehicleDetailsStep({ data, onChange, onNestedChange }) {
  // Create refs for file inputs
  const valuationInputRef = useRef(null);
  const crBookInputRef = useRef(null);
  const vehicleImagesInputRef = useRef(null);

  // Initialize the form with React Hook Form
  const form = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      type: data.vehicle?.type || '',
      make: data.vehicle?.make || '',
      model: data.vehicle?.model || '',
      vehicleNo: data.vehicle?.vehicleNo || '',
      chassisNo: data.vehicle?.chassisNo || '',
      engineNo: data.vehicle?.engineNo || '',
      firstRegDate: data.vehicle?.firstRegDate || '',
      engineCapacity: data.vehicle?.engineCapacity || '',
      yom: data.vehicle?.yom || '',
      meterReading: data.vehicle?.meterReading || '',
      valuationAmount: data.vehicle?.valuationAmount || '',
      valuerName: data.vehicle?.valuerName || '',
    }
  });

  const [documentsState, setDocumentsState] = useState({
    valuation: data.vehicle?.documents?.valuation || null,
    crBook: data.vehicle?.documents?.crBook || null,
    vehicleImages: data.vehicle?.documents?.vehicleImages || []
  });
  
  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    uploadedFiles: [],
    progress: {}
  });

  const handleTextChange = (name, value, field) => {
    field.onChange(value);
    if (name !== 'downPayment') {
      onNestedChange('vehicle', name, value);
    }
  };

  const handleSelectChange = (name, value, field) => {
    field.onChange(value);
    onNestedChange('vehicle', name, value);
  };

  const handleDateChange = (name, date, field) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    field.onChange(formattedDate);
    onNestedChange('vehicle', name, formattedDate);
  };
  
  const handleFileChange = (docType, files) => {
    if (docType === 'valuation' && files && files.length > 0) {
      const file = files[0];
      setDocumentsState(prev => ({ ...prev, valuation: file }));
      onNestedChange('vehicle', 'documents', { 
        ...data.vehicle?.documents, 
        valuation: file 
      });
    } else if (docType === 'crBook' && files && files.length > 0) {
      const file = files[0];
      setDocumentsState(prev => ({ ...prev, crBook: file }));
      onNestedChange('vehicle', 'documents', { 
        ...data.vehicle?.documents, 
        crBook: file 
      });
    } else if (docType === 'vehicleImages' && files && files.length > 0) {
      const newImages = Array.from(files);
      const updatedImages = [...documentsState.vehicleImages, ...newImages];
      setDocumentsState(prev => ({ ...prev, vehicleImages: updatedImages }));
      onNestedChange('vehicle', 'documents', { 
        ...data.vehicle?.documents, 
        vehicleImages: updatedImages
      });
    }
  };

  // Function to save vehicle details and documents
  const saveVehicleDetails = async () => {
    try {
      // First upload all files if there are any
      let valuationReport = '';
      let crBook = '';
      let vehicleImage = '';
      
      // Only upload files if they exist in the documents state
      const hasFilesToUpload = documentsState.valuation || documentsState.crBook || documentsState.vehicleImages.length > 0;
      
      if (hasFilesToUpload) {
        // const uploadedFiles = await handleUploadFiles();
        console.log('Uploaded files:', JSON.stringify(uploadedFiles));
        console.log('Uploaded files:', uploadedFiles);
        
        
        // Get the filenames of the uploaded files from the PHP API response
        valuationReport = uploadedFiles.find(f => f.type === 'valuation')?.url || '';
        crBook = uploadedFiles.find(f => f.type === 'crBook')?.url || '';
        // For vehicle images, we'll take the first one if available
        vehicleImage = uploadedFiles.find(f => f.type === 'vehicleImage')?.url || '';
      }
      
      // Get current form values
      const formValues = form.getValues();
      console.log('Form values:', formValues);
      
      // Prepare vehicle data for database
      const vehicleDataForDb = {
        loanId: data.loanId,
        type: formValues.type || '',
        make: formValues.make || '',
        model: formValues.model || '',
        vehicleNo: formValues.vehicleNo || '',
        chassisNo: formValues.chassisNo || '',
        engineNo: formValues.engineNo || '',
        firstRegDate: formValues.firstRegDate || null,
        engineCapacity: formValues.engineCapacity || '',
        yom: formValues.yom || null,
        meterReading: formValues.meterReading || null,
        valuerName: formValues.valuerName || '',
        // Use the uploaded file URLs or existing ones from form data
        valuationReport: valuationReport || formValues.valuationReport || '',
        crBook: crBook || formValues.crBook || '',
        vehicleImage: vehicleImage || formValues.vehicleImage || ''
      };
      
      console.log('Sending to API:', vehicleDataForDb);

      // Save vehicle details to database
      const response = await fetch('/api/loan/auto/save-vehicle-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleDataForDb)
      });

      const result = await response.json();

      if (result.code !== 'SUCCESS') {
        throw new Error(result.message || 'Failed to save vehicle details');
      }
      
      // Update the form data with the saved information
      const updatedFormData = {
        ...formValues,
        // Only update the file fields if we have new values
        ...(valuationReport && { valuationReport }),
        ...(crBook && { crBook }),
        ...(vehicleImage && { vehicleImage }),
        vehicleId: result.data.vehicleId
      };
      
      // Call the parent's onChange with the updated data
      onChange(updatedFormData);
      
      // Also update the documents state to clear the uploaded files
      setDocumentsState({
        valuation: null,
        crBook: null,
        vehicleImages: []
      });
      
      return true;
    } catch (error) {
      console.error('Error saving vehicle details:', error);
      // Show error message to user
      alert(`Error saving vehicle details: ${error.message}`);
      return false;
    }
  };
  
  const removeImage = (index) => {
    const updatedImages = [...documentsState.vehicleImages];
    updatedImages.splice(index, 1);
    setDocumentsState(prev => ({ ...prev, vehicleImages: updatedImages }));
    onNestedChange('vehicle', 'documents', { 
      ...data.vehicle?.documents, 
      vehicleImages: updatedImages.map(img => img.name) 
    });
  };

  // Calculate loan amount based on valuation and down payment
  const calculateLoanAmount = () => {
    const valuation = parseFloat(form.watch('valuationAmount') || 0);
    const downPayment = parseFloat(form.watch('downPayment') || 0);
    
    if (valuation > 0 && downPayment > 0) {
      const loanAmount = valuation - downPayment;
      return loanAmount > 0 ? loanAmount.toFixed(2) : '0.00';
    }
    return '0.00';
  };

  // Upload all files one by one
  const handleUploadFiles = async () => {
    try {
      setUploadStatus(prev => ({ ...prev, isUploading: true }));
      
      const filesToUpload = [
        { type: 'valuation', file: documentsState.valuation },
        { type: 'crBook', file: documentsState.crBook },
        ...documentsState.vehicleImages.map(file => ({ type: 'vehicleImage', file }))
      ].filter(item => item.file);

     
      
      for (const { type, file } of filesToUpload) {
        try {
          setUploadStatus(prev => ({
            ...prev,
            progress: { ...prev.progress, [file.name]: 'uploading' }
          }));
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', type);
          formData.append('customerId', data.customerId);
          formData.append('loanId', data.loanId);
          
          const response = await fetch('/api/loan/auto/upload-document', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          
          const result = await response.json();
          console.log('Upload result:', result);
          
          if (result && result.code === 'SUCCESS') {
            uploadedFiles.push({
              type,
              name: file.name,
              url: result.data.filename,
              uploadedAt: new Date().toISOString()
            });
            
            setUploadStatus(prev => ({
              ...prev,
              progress: { ...prev.progress, [file.name]: 'done' }
            }));
          } else {
            throw new Error(result?.message || 'Upload failed');
          }
          console.log('Uploaded files:', uploadedFiles);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadStatus(prev => ({
            ...prev,
            progress: { ...prev.progress, [file.name]: 'error' }
          }));
        }
      }
      
      setUploadStatus(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles]
      }));
      
      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus(prev => ({ ...prev, isUploading: false }));
      throw error;
    }
  };

  // Expose the saveVehicleDetails method to parent component
  const rootRef = useRef(null);
  
  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.saveVehicleDetails = saveVehicleDetails;
      rootRef.current.uploadFiles = handleUploadFiles;
    }
  }, [saveVehicleDetails, handleUploadFiles]);

  return (
    <Form {...form}>
      <div className="space-y-6" ref={rootRef} data-vehicle-step>
        <div>
          <h2 className="text-xl font-semibold mb-2">Vehicle Details</h2>
          <p className="text-sm text-gray-500">
            Please provide information about the vehicle you're financing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select 
                      value={field.value}
                      onValueChange={(value) => handleSelectChange('type', value, field)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MotorBike">Motor Bike</SelectItem>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Lorry">Lorry</SelectItem>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="ThreeWheeler">Three Wheeler</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('vehicleNo', e.target.value, field)}
                        placeholder="ABC-1234" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('make', e.target.value, field)}
                        placeholder="Toyota, Honda, etc." 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('model', e.target.value, field)}
                        placeholder="Corolla, Civic, etc." 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Manufacture</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('yom', e.target.value, field)}
                        placeholder="2022" 
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Capacity (cc)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('engineCapacity', e.target.value, field)}
                        placeholder="1500" 
                        type="number"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chassisNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chassis Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('chassisNo', e.target.value, field)}
                        placeholder="Vehicle chassis number" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('engineNo', e.target.value, field)}
                        placeholder="Vehicle engine number" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstRegDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Registration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span className="text-muted-foreground">Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => date && handleDateChange('firstRegDate', date, field)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meterReading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter Reading (km)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('meterReading', e.target.value, field)}
                        placeholder="Current odometer reading" 
                        type="number"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valuation and Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valuationAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valuation Amount (Market Value)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('valuationAmount', e.target.value, field)}
                        placeholder="Vehicle value in LKR" 
                        type="number"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The appraised market value of the vehicle
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valuerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valuer's Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('valuerName', e.target.value, field)}
                        placeholder="Name of the valuer" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        onChange={(e) => handleTextChange('downPayment', e.target.value, field)}
                        placeholder="Initial payment amount" 
                        type="number"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The amount you're paying upfront (typically 20-30% of vehicle value)
                    </FormDescription>
                  </FormItem>
                )}
              />

            
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Documents</CardTitle>
            <CardDescription>
              Upload all required vehicle documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FormLabel>Valuation Report</FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    className="hidden"
                    ref={valuationInputRef}
                    onChange={(e) => handleFileChange('valuation', e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => valuationInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {documentsState.valuation ? 'Change File' : 'Upload Valuation'}
                  </Button>
                </div>
                {documentsState.valuation && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    {documentsState.valuation.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>CR Book</FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    className="hidden"
                    ref={crBookInputRef}
                    onChange={(e) => handleFileChange('crBook', e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => crBookInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {documentsState.crBook ? 'Change File' : 'Upload CR Book'}
                  </Button>
                </div>
                {documentsState.crBook && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    {documentsState.crBook.name}
                  </div>
                )}
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <FormLabel>Vehicle Images</FormLabel>
                    <p className="text-xs text-gray-500">
                      Upload images of the vehicle from different angles (front, back, sides, interior)
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleUploadFiles}
                    disabled={uploadStatus.isUploading || 
                      (!documentsState.valuation && !documentsState.crBook && documentsState.vehicleImages.length === 0)}
                    className="ml-4"
                  >
                    {uploadStatus.isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload All Files
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    multiple
                    className="hidden"
                    ref={vehicleImagesInputRef}
                    onChange={(e) => handleFileChange('vehicleImages', e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => vehicleImagesInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Add Vehicle Images
                  </Button>
                </div>
                {/* Upload status */}
                <div className="space-y-2 mt-2">
                  {documentsState.valuation && (
                    <div className="flex items-center text-sm">
                      <span className="w-40 truncate">{documentsState.valuation.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {uploadStatus.progress[documentsState.valuation.name] === 'uploading' && 'Uploading...'}
                        {uploadStatus.progress[documentsState.valuation.name] === 'done' && '✓ Uploaded'}
                        {uploadStatus.progress[documentsState.valuation.name] === 'error' && '✗ Error'}
                      </span>
                    </div>
                  )}
                  {documentsState.crBook && (
                    <div className="flex items-center text-sm">
                      <span className="w-40 truncate">{documentsState.crBook.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {uploadStatus.progress[documentsState.crBook.name] === 'uploading' && 'Uploading...'}
                        {uploadStatus.progress[documentsState.crBook.name] === 'done' && '✓ Uploaded'}
                        {uploadStatus.progress[documentsState.crBook.name] === 'error' && '✗ Error'}
                      </span>
                    </div>
                  )}
                  {documentsState.vehicleImages.map((image, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="w-40 truncate">{image.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {uploadStatus.progress[image.name] === 'uploading' && 'Uploading...'}
                        {uploadStatus.progress[image.name] === 'done' && '✓ Uploaded'}
                        {uploadStatus.progress[image.name] === 'error' && '✗ Error'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Preview of uploaded vehicle images */}
                {documentsState.vehicleImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {documentsState.vehicleImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-600 overflow-hidden">
                            {image.name || `Image ${index + 1}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
