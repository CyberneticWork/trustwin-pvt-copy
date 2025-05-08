// app/api/loan/EQloan/guarantor/route.js
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

    const guarantorData = data.guarantorData || {};
    
    // Validate guarantor data
    if (!guarantorData.name || !guarantorData.nic) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Guarantor name and NIC are required' },
        { status: 400 }
      );
    }

    connection = await connectDB();

    // Check if guarantor with same NIC already exists for this loan
    const [existingGuarantors] = await connection.execute(
      'SELECT id FROM guarantor WHERE loandid = ? AND nic = ?',
      [data.loanId, guarantorData.nic]
    );

    let result;
    if (existingGuarantors.length > 0) {
      // Update existing guarantor
      [result] = await connection.execute(
        `UPDATE guarantor SET 
          name = ?,
          gender = ?,
          dob = ?,
          relation = ?,
          address = ?,
          province = ?,
          gs = ?,
          ds = ?,
          district = ?,
          number = ?,
          income = ?,
          type = ?,
          accountno = ?,
          bankname = ?
        WHERE loandid = ? AND nic = ?`,
        [
          guarantorData.name,
          guarantorData.gender === 'Male' ? 1 : 0,
          guarantorData.dateOfBirth || null,
          guarantorData.relationship || '',
          guarantorData.address || '',
          guarantorData.province || '',
          guarantorData.gsDivision || '',
          guarantorData.dsOffice || '',
          guarantorData.district || '',
          guarantorData.mobile || '',
          guarantorData.income || 0,
          guarantorData.employment || '',
          guarantorData.accountNumber || '',
          guarantorData.bankName || '',
          data.loanId,
          guarantorData.nic
        ]
      );
    } else {
      // Insert new guarantor
      [result] = await connection.execute(
        `INSERT INTO guarantor (
          customerid, loandid, name, nic, gender, dob, relation,
          address, province, gs, ds, district, number, income,
          type, accountno, bankname
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.customerId,
          data.loanId,
          guarantorData.name,
          guarantorData.nic,
          guarantorData.gender === 'Male' ? 1 : 0,
          guarantorData.dateOfBirth || null,
          guarantorData.relationship || '',
          guarantorData.address || '',
          guarantorData.province || '',
          guarantorData.gsDivision || '',
          guarantorData.dsOffice || '',
          guarantorData.district || '',
          guarantorData.mobile || '',
          guarantorData.income || 0,
          guarantorData.employment || '',
          guarantorData.accountNumber || '',
          guarantorData.bankName || ''
        ]
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Guarantor details saved successfully',
      data: { 
        loanId: data.loanId,
        customerId: data.customerId,
        guarantorNic: guarantorData.nic,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error('Error saving guarantor details:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to save guarantor details',
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
