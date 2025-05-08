// app/api/loan/EQloan/employment/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.loanId || !data.customerId) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Loan ID and customer ID are required' },
        { status: 400 }
      );
    }

    const employmentData = data.employmentData || {};
    connection = await connectDB();

    // Check if employment details already exist for this loan
    const [existingRecords] = await connection.execute(
      'SELECT id FROM equipment_loan_employment WHERE loandid = ?',
      [data.loanId]
    );

    let result;
    if (existingRecords.length > 0) {
      // Update existing record
      [result] = await connection.execute(
        `UPDATE equipment_loan_employment SET 
          employment_type = ?,
          number = ?,
          address = ?,
          nature_of_business = ?,
          period = ?,
          name = ?,
          type = ?,
          bussnessregno = ?,
          jobtitle = ?,
          updated_at = NOW()
        WHERE loandid = ?`,
        [
          employmentData.employmentType || '',
          employmentData.companyRegistrationNumber || employmentData.businessRegistrationNumber || '',
          employmentData.businessAddress || '',
          employmentData.natureOfBusiness || '',
          employmentData.experienceYears || employmentData.businessPeriod || '',
          employmentData.companyName || employmentData.businessName || '',
          employmentData.businessType || '',
          employmentData.businessRegistrationNumber || '',
          employmentData.designation || employmentData.employmentTypeDetail || '',
          data.loanId
        ]
      );
    } else {
      // Insert new record
      [result] = await connection.execute(
        `INSERT INTO equipment_loan_employment (
          customerid, loandid, employment_type, number, address,
          nature_of_business, period, name, type, bussnessregno, jobtitle
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.customerId,
          data.loanId,
          employmentData.employmentType || '',
          employmentData.companyRegistrationNumber || employmentData.businessRegistrationNumber || '',
          employmentData.businessAddress || '',
          employmentData.natureOfBusiness || '',
          employmentData.experienceYears || employmentData.businessPeriod || '',
          employmentData.companyName || employmentData.businessName || '',
          employmentData.businessType || '',
          employmentData.businessRegistrationNumber || '',
          employmentData.designation || employmentData.employmentTypeDetail || ''
        ]
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Employment details saved successfully',
      data: { 
        loanId: data.loanId,
        customerId: data.customerId,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error('Error saving employment details:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to save employment details',
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
