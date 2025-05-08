// app/api/loan/EQloan/supplier/route.js
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

    const supplierData = data.supplierData || {};
    connection = await connectDB();

    // Check if supplier details already exist for this loan
    const [existingSupplier] = await connection.execute(
      'SELECT id FROM equipment_supplier_details WHERE loanid = ?',
      [data.loanId]
    );

    let result;
    if (existingSupplier.length > 0) {
      // Update existing supplier
      [result] = await connection.execute(
        `UPDATE equipment_supplier_details SET 
          name = ?,
          br_number = ?,
          id_number = ?,
          account_number = ?,
          bank_name = ?,
          branch_name = ?,
          updated_at = NOW()
        WHERE loanid = ?`,
        [
          supplierData.name || '',
          supplierData.brNumber || '',
          supplierData.idNumber || '',
          supplierData.accountNumber || '',
          supplierData.bankName || '',
          supplierData.branchName || '',
          data.loanId
        ]
      );
    } else {
      // Insert new supplier
      [result] = await connection.execute(
        `INSERT INTO equipment_supplier_details (
          loanid, name, br_number, id_number, account_number,
          bank_name, branch_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.loanId,
          supplierData.name || '',
          supplierData.brNumber || '',
          supplierData.idNumber || '',
          supplierData.accountNumber || '',
          supplierData.bankName || '',
          supplierData.branchName || ''
        ]
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Supplier details saved successfully',
      data: { 
        loanId: data.loanId,
        customerId: data.customerId,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error('Error saving supplier details:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to save supplier details',
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
