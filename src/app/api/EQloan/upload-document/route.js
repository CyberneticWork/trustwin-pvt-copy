// app/api/loan/EQloan/upload-document/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  let connection;
  try {
    // Create FormData from the request
    const formData = await request.formData();
    
    const loanId = formData.get('loanId');
    const customerId = formData.get('customerId');
    const documentType = formData.get('documentType');
    const index = formData.get('index');
    const file = formData.get('file');
    
    // Validate required fields
    if (!loanId || !file || !documentType) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Loan ID, document type, and file are required' },
        { status: 400 }
      );
    }
    
    // Validate file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Invalid file submitted' },
        { status: 400 }
      );
    }
    
    // Get file extension
    const fileExt = path.extname(file.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
    
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Invalid file format. Allowed formats: jpg, jpeg, png, pdf, doc, docx' },
        { status: 400 }
      );
    }
    
    // Create filename based on loanId, documentType and timestamp
    const timestamp = Date.now();
    const filename = `${loanId}_${documentType}${index ? '_' + index : ''}_${timestamp}${fileExt}`;
    
    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'public', 'uploads', 'equipment');
    try {
      await mkdir(dir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(dir, filename);
    await writeFile(filepath, buffer);
    
    // Store file reference in database based on document type
    connection = await connectDB();
    
    // Check if documentation record exists for this loan
    const [existingDocs] = await connection.execute(
      'SELECT id FROM equipment_documentation WHERE loanid = ?',
      [loanId]
    );
    
    let result;
    const fileUrl = `/uploads/equipment/${filename}`;
    
    if (existingDocs.length > 0) {
      // Update existing record based on document type
      if (documentType === 'residence') {
        [result] = await connection.execute(
          'UPDATE equipment_documentation SET residence_image = ?, updated_at = NOW() WHERE loanid = ?',
          [fileUrl, loanId]
        );
      } else if (documentType === 'selfie') {
        [result] = await connection.execute(
          'UPDATE equipment_documentation SET selfie_image = ?, updated_at = NOW() WHERE loanid = ?',
          [fileUrl, loanId]
        );
      } else if (documentType === 'invoice') {
        [result] = await connection.execute(
          'UPDATE equipment_documentation SET invoice_document = ?, updated_at = NOW() WHERE loanid = ?',
          [fileUrl, loanId]
        );
      } else if (documentType === 'deviceImage') {
        // First get existing device images
        const [existingImages] = await connection.execute(
          'SELECT device_images FROM equipment_documentation WHERE loanid = ?',
          [loanId]
        );
        
        let deviceImages = [];
        try {
          if (existingImages[0].device_images) {
            deviceImages = JSON.parse(existingImages[0].device_images);
          }
        } catch (e) {
          console.error('Error parsing device images:', e);
          deviceImages = [];
        }
        
        // Add new image
        deviceImages.push(fileUrl);
        
        // Update record
        [result] = await connection.execute(
          'UPDATE equipment_documentation SET device_images = ?, updated_at = NOW() WHERE loanid = ?',
          [JSON.stringify(deviceImages), loanId]
        );
      }
    } else {
      // Create new record based on document type
      const docData = {
        loanid: loanId,
        residence_image: documentType === 'residence' ? fileUrl : null,
        selfie_image: documentType === 'selfie' ? fileUrl : null,
        invoice_document: documentType === 'invoice' ? fileUrl : null,
        device_images: documentType === 'deviceImage' ? JSON.stringify([fileUrl]) : null
      };
      
      [result] = await connection.execute(
        `INSERT INTO equipment_documentation (
          loanid, residence_image, selfie_image, invoice_document, device_images
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          loanId,
          docData.residence_image,
          docData.selfie_image,
          docData.invoice_document,
          docData.device_images
        ]
      );
    }
    
    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Document uploaded successfully',
      data: {
        loanId,
        documentType,
        filename: fileUrl,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to upload document',
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing database connection:', e);
      }
    }
  }
}
