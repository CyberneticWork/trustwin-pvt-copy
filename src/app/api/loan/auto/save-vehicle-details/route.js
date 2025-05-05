import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    console.log('Received vehicle data:', data);
    
    // Extract data from request
    const {
      loanId,
      type,
      make,
      model,
      vehicleNo,
      chassisNo,
      engineNo,
      firstRegDate,
      engineCapacity,
      yom,
      meterReading,
      valuerName,
      // File upload fields - these are optional
      valuationReport = '',
      crBook = '',
      vehicleImage = ''
    } = data;

    // Validate required fields
    const requiredFields = {
      loanId: 'Loan ID',
      type: 'Vehicle Type',
      make: 'Make',
      model: 'Model',
      vehicleNo: 'Vehicle Number',
      chassisNo: 'Chassis Number',
      engineNo: 'Engine Number'
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

    // Check if vehicle details already exist for this loan
    const [existingVehicle] = await connection.execute(
      'SELECT id FROM vehicle_details WHERE loanid = ?',
      [loanId]
    );

    let result;
    let isUpdate = existingVehicle.length > 0;

    if (isUpdate) {
      // Update existing vehicle details
      [result] = await connection.execute(
        `UPDATE vehicle_details SET 
          type = ?,
          make = ?,
          model = ?,
          vehicle_no = ?,
          chassis_no = ?,
          engine_no = ?,
          first_reg_date = ?,
          engine_capacity = ?,
          yom = ?,
          meter_reading = ?,
          valuer_name = ?,
          valivationreport = ?,
          drbook = ?,
          vehicalimage = ?,
          updated_at = NOW()
        WHERE loanid = ?`,
        [
          type,
          make,
          model,
          vehicleNo,
          chassisNo,
          engineNo,
          firstRegDate || null,
          engineCapacity || null,
          yom || null,
          meterReading || null,
          valuerName || null,
          valuationReport || '',
          crBook || '',
          vehicleImage || '',
          loanId
        ]
      );
    } else {
      // Insert new vehicle details
      [result] = await connection.execute(
        `INSERT INTO vehicle_details (
          loanid, type, make, model, vehicle_no, chassis_no, engine_no, 
          first_reg_date, engine_capacity, yom, meter_reading, valuer_name,
          valivationreport, drbook, vehicalimage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          loanId,
          type,
          make,
          model,
          vehicleNo,
          chassisNo,
          engineNo,
          firstRegDate || null,
          engineCapacity || null,
          yom || null,
          meterReading || null,
          valuerName || null,
          valuationReport || '',
          crBook || '',
          vehicleImage || ''
        ]
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: isUpdate ? 'Vehicle details updated successfully' : 'Vehicle details saved successfully',
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
      errorMessage = 'Vehicle with these details already exists';
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
