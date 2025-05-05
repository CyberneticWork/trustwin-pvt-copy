import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  let connection;
  try {
    const { loanId, customerId, comments, status } = await request.json();

    // Validate required fields
    if (!loanId || !customerId) {
      return NextResponse.json(
        { 
          code: 'ERROR', 
          message: 'Missing required fields: loanId and customerId are required' 
        },
        { status: 400 }
      );
    }

    // Connect to the database
    connection = await connectDB();

    // Update the loan application with comments and status
    const [result] = await connection.execute(
      `UPDATE auto_loan_applications 
       SET comment = ?, status = ?, updated_at = NOW() 
       WHERE id = ? AND customer_id = ?`,
      [comments || '', 'under the review', loanId, customerId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { 
          code: 'NOT_FOUND', 
          message: 'Loan application not found or already updated' 
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Loan application submitted successfully',
      data: { 
        loanId,
        status: status || 'pending',
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        code: 'DATABASE_ERROR', 
        message: error.message || 'Failed to update loan application',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    // Ensure connection is always closed
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing database connection:', e);
      }
    }
  }
}
