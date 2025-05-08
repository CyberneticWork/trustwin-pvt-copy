// app/api/loan/EQloan/details/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Equipment loan ID is required' },
        { status: 400 }
      );
    }

    connection = await connectDB();

    // Fetch equipment loan application
    const [loans] = await connection.execute(
      `SELECT * FROM equipment_loan_applications WHERE id = ?`,
      [id]
    );

    if (loans.length === 0) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Equipment loan not found' },
        { status: 404 }
      );
    }

    const loan = loans[0];

    // Fetch customer details
    const [customers] = await connection.execute(
      `SELECT * FROM customer WHERE id = ?`,
      [loan.customer_id]
    );

    if (customers.length === 0) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customers[0];
    
    return NextResponse.json({
      code: 'SUCCESS',
      data: {
        loan,
        customer
      }
    });

  } catch (error) {
    console.error('Error fetching equipment loan details:', error);
    return NextResponse.json(
      { 
        code: 'ERROR', 
        message: 'Failed to fetch equipment loan details',
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
