import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerId,
      loanId,
      equipmentData // expects an object with all equipment fields
    } = body;

    console.log('[EQloan/equipment] Incoming POST:', { customerId, loanId, equipmentData });

    if (!customerId || !loanId || !equipmentData) {
      console.error('[EQloan/equipment] Missing required fields:', { customerId, loanId, equipmentData });
      return NextResponse.json({ code: 'ERROR', message: 'Missing required fields', received: { customerId, loanId, equipmentData } }, { status: 400 });
    }

    let connection;
    try {
      connection = await connectDB();
      const sql = `INSERT INTO eqdetails
        (customerid, loandid, Make, Model, SerialNumber, Capacity, Generation, YearManufacture, MarketValue, DevicePrice, DownPayment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const sqlParams = [
        customerId,
        loanId,
        equipmentData.make,
        equipmentData.model,
        equipmentData.serialNumber,
        equipmentData.capacity,
        equipmentData.generation,
        equipmentData.yom,
        equipmentData.valuationAmount,
        equipmentData.devicePrice,
        equipmentData.downPayment
      ];
      console.log('[EQloan/equipment] Executing SQL:', sql, sqlParams);
      const [result] = await connection.execute(sql, sqlParams);
      return NextResponse.json({ code: 'SUCCESS', message: 'Equipment details saved', id: result.insertId, received: { customerId, loanId, equipmentData } });
    } catch (sqlError) {
      console.error('[EQloan/equipment] SQL Error:', sqlError);
      return NextResponse.json({ code: 'ERROR', message: sqlError.message }, { status: 500 });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } catch (error) {
    console.error('[EQloan/equipment] General Error:', error);
    return NextResponse.json({ code: 'ERROR', message: error.message }, { status: 500 });
  }
}

