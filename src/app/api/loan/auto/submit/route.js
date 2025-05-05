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

    // First, generate the contract ID
    const [loanData] = await connection.execute(
      `SELECT ala.id, ala.CROid, e.branchID 
       FROM auto_loan_applications ala
       JOIN employees e ON ala.CROid = e.id 
       WHERE ala.id = ?`,
      [parseInt(loanId, 10)]
    );

    if (loanData.length === 0) {
      return NextResponse.json(
        { 
          code: 'NOT_FOUND', 
          message: 'Loan application not found' 
        },
        { status: 404 }
      );
    }

    const branchId = loanData[0].branchID;
    
    // Get branch shortcode
    const [branches] = await connection.execute(
      'SELECT shortcode FROM branches WHERE id = ?',
      [branchId]
    );

    if (branches.length === 0) {
      return NextResponse.json(
        { 
          code: 'ERROR', 
          message: 'Branch not found' 
        },
        { status: 500 }
      );
    }

    const branchCode = branches[0].shortcode;

    // Format contract ID: branchCode + 'MB' + 'HP' + 5-digit loan ID
    const contractId = `${branchCode}MBHP${String(loanId).padStart(5, '0')}`;

    // Update the loan application with contract ID, comments and status
    const [result] = await connection.execute(
      `UPDATE auto_loan_applications 
       SET contractid = ?, comment = ?, status = ?, updated_at = NOW() 
       WHERE id = ? AND customer_id = ?`,
      [contractId, comments || '', 'under the review', loanId, customerId]
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
