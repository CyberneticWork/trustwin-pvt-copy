// app/api/loan/EQloan/update/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Equipment loan ID is required' },
        { status: 400 }
      );
    }

    connection = await connectDB();

    // Update the loan details with residence and utility bill information
    await connection.execute(
      `UPDATE equipment_loan_applications SET 
        residenttype = ?,
        billtype = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        data.residenceType || '',
        data.utilityBillType || '',
        data.id
      ]
    );

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Equipment loan personal details updated successfully',
      data: { id: data.id }
    });

  } catch (error) {
    console.error('Error updating equipment loan personal details:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to update equipment loan personal details',
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
