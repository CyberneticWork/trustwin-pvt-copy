// app/api/loan/EQloan/bank/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
 
  
  let connection;
  try {
    const data = await request.json();
    console.log(data);
    
    // Validate required fields
    if (!data.loanId || !data.customerId) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Loan ID and customer ID are required' },
        { status: 400 }
      );
    }

    const bankData = data.bankData || {};
    connection = await connectDB();

    // Check if bank details already exist for this loan
    const [existingRecords] = await connection.execute(
      'SELECT id FROM bankdetails WHERE loandid = ?',
      [data.loanId]
    );

    let result;
    if (existingRecords.length > 0) {
      // Update existing record
      [result] = await connection.execute(
        `UPDATE bankdetails SET 
          acctype = ?,
          bank = ?,
          acno = ?,
          branch = ?,
          period = ?,
          Turnover1 = ?,
          Turnover2 = ?,
          Turnover3 = ?
        WHERE loandid = ?`,
        [
          bankData.acctype || '',
          bankData.bank || '',
          bankData.acno || '',
          bankData.branch || '',
          bankData.period || 0,
          bankData.month1 || 0,
          bankData.month2 || 0,
          bankData.month3 || 0,
          data.loanId
        ]
      );
    } else {
      // Insert new record
      [result] = await connection.execute(
        `INSERT INTO bankdetails (
          customerid, loandid, acctype, bank, acno, branch, period,
          Turnover1, Turnover2, Turnover3
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.customerId,
          data.loanId,
          bankData.acctype || '',
          bankData.bank || '',
          bankData.acno || '',
          bankData.branch || '',
          bankData.period || 0,
          bankData.month1 || 0,
          bankData.month2 || 0,
          bankData.month3 || 0
        ]
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Bank details saved successfully',
      data: { 
        loanId: data.loanId,
        customerId: data.customerId,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error('Error saving bank details:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to save bank details',
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
