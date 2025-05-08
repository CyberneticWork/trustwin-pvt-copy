// app/api/loan/EQloan/submit/route.js
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

    connection = await connectDB();

    // Update the loan status and add any comments
    await connection.execute(
      `UPDATE equipment_loan_applications SET 
        status = ?,
        comment = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        data.status || 'pending',
        data.comments || '',
        data.loanId
      ]
    );

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Equipment loan application submitted successfully',
      data: { 
        loanId: data.loanId,
        status: data.status || 'pending'
      }
    });

  } catch (error) {
    console.error('Error submitting equipment loan application:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to submit equipment loan application',
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
