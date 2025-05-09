import { NextResponse } from 'next/server';

// Your PHP API endpoint
const UPLOAD_API_URL = 'http://127.0.0.1/api/upload.php';
let response  = null;

// Helper function to create FormData from file and metadata
async function createFormData(file, loanId) {
  const formData = new FormData();
  formData.append('image', new Blob([await file.arrayBuffer()]), file.name);
  formData.append('loan_id', loanId);
  // No document_type
  return formData;
}

export async function POST(request) {
  try {
    // Log the incoming request headers and form data
    console.log('Incoming request headers:', Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    
    // Log all form data keys and values
    const formDataObj = {};
    for (const [key, value] of formData.entries()) {
      formDataObj[key] = value instanceof File ? 
        { name: value.name, type: value.type, size: value.size } : 
        value;
    }
    console.log('Form data received:', formDataObj);
    
    const file = formData.get('file');
    const customerId = formData.get('customerId');
    const loanId = formData.get('loanId');
    
    console.log('Extracted values:', { file: file?.name, customerId, loanId });
    
    if (!file || !loanId) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // Create form data for the PHP API
      const uploadFormData = await createFormData(file, loanId);
      
      console.log('Sending request to PHP API:', {
        url: UPLOAD_API_URL,
        method: 'POST',
        file: file.name,
        loanId,
        customerId
      });

      // Forward the file to the PHP API
      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: uploadFormData,
        // Don't set Content-Type header - let the browser set it with the correct boundary
      });

      const responseText = await response.text();
      console.log('Raw PHP API response:', responseText);
      
      if (!response.ok) {
        console.error('PHP API error response:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        });
        throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed PHP API response:', result);
      } catch (jsonError) {
        console.error('Failed to parse PHP API response as JSON:', {
          error: jsonError,
          responseText: responseText
        });
        throw new Error('Invalid JSON response from server');
      }
      
      return NextResponse.json({
        code: 'SUCCESS',
        message: 'File uploaded successfully',
        data: {
          url: result.url || '',  // Adjust based on your API response
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          // Include any additional data from your PHP API
          ...result
        }
      });
      
    } catch (error) {
      console.error('Error uploading file to PHP API:', error);
      return NextResponse.json(
        { code: 'ERROR', message: error.message || 'Failed to upload file' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing upload request:', error);
    return NextResponse.json(
      { code: 'ERROR', message: error.message || 'Failed to process upload request' },
      { status: 500 }
    );
  }
}
