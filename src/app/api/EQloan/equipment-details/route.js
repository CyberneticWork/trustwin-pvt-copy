// app/api/loan/EQloan/equipment-details/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    console.log('Received equipment data:', data);
    
    // Extract data from request
    const {
      loanId,
      type,
      make,
      model,
      serialNumber,
      imeiNumber,
      capacity,
      generation,
      yom,
      valuationAmount,
      // File upload fields - these are optional
      invoice = '',
      deviceImages = []
    } = data;

    // Validate required fields
    const requiredFields = {
      loanId: 'Loan ID',
      make: 'Make',
      model: 'Model',
      serialNumber: 'Serial Number',
      imeiNumber: 'IMEI Number'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !data[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      console.error('Validation error:', errorMessage);
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR', 
          message: errorMessage,
          missingFields: missingFields.map(f => f.toLowerCase().replace(/\s+/g, ''))
        },
        { status: 400 }
      );
    }

    // Connect to the database
    connection = await connectDB();

    // Check if equipment details already exist for this loan
    const [existingEquipment] = await connection.execute(
      'SELECT id FROM equipment_details WHERE loanid = ?',
      [loanId]
    );

    let result;
    let isUpdate = existingEquipment.length > 0;

    // Prepare device images as JSON string
    const deviceImagesJson = Array.isArray(deviceImages) ? JSON.stringify(deviceImages) : '[]';

    if (isUpdate) {
      // Update existing equipment details
      [result] = await connection.execute(
        `UPDATE equipment_details SET 
          type = ?,
          make = ?,
          model = ?,
          serial_number = ?,
          imei_number = ?,
          capacity = ?,
          generation = ?,
          yom = ?,
          valuation_amount = ?,
          invoice = ?,
          device_images = ?,
          updated_at = NOW()
        WHERE loanid = ?`,
        [
          type || 'SMART_MOBILE',
          make,
          model,
          serialNumber,
          imeiNumber,
          capacity || null,
          generation || null,
          yom || null,
          valuationAmount || null,
          invoice || '',
          deviceImagesJson,
          loanId
        ]
      );
    } else {
      // Insert new equipment details
      [result] = await connection.execute(
        `INSERT INTO equipment_details (
          loanid, type, make, model, serial_number, imei_number, 
          capacity, generation, yom, valuation_amount,
          invoice, device_images, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          loanId,
          type || 'SMART_MOBILE',
          make,
          model,
          serialNumber,
          imeiNumber,
          capacity || null,
          generation || null,
          yom || null,
          valuationAmount || null,
          invoice || '',
          deviceImagesJson
        ]
      );
    }

    // Update loan amount and device price in equipment_loan_applications table
    const [updateLoan] = await connection.execute(
      `UPDATE equipment_loan_applications SET 
        device_price = ?,
        down_payment = ?,
        loan_amount = ?
      WHERE id = ?`,
      [
        data.devicePrice || 0,
        data.downPayment || 0,
        (parseFloat(data.devicePrice || 0) - parseFloat(data.downPayment || 0)),
        loanId
      ]
    );

    return NextResponse.json({
      code: 'SUCCESS',
      message: isUpdate ? 'Equipment details updated successfully' : 'Equipment details saved successfully',
      data: {
        loanId,
        isUpdate,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    
    // Handle specific error cases
    let errorCode = 'SERVER_ERROR';
    let statusCode = 500;
    let errorMessage = 'Failed to process request';

    if (error.code === 'ER_DUP_ENTRY') {
      errorCode = 'DUPLICATE_ENTRY';
      statusCode = 400;
      errorMessage = 'Equipment with these details already exists';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorCode = 'INVALID_LOAN';
      statusCode = 400;
      errorMessage = 'Invalid loan reference';
    } else if (error.sqlMessage) {
      errorMessage = `Database error: ${error.sqlMessage}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        code: errorCode,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: statusCode }
    );
  } finally {
    // Close the database connection if it was opened
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing database connection:', e);
      }
    }
  }
}
