import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";

export async function POST(request) {
  try {
    const { id, comment } = await request.json();
    
    if (!id || !comment) {
      return NextResponse.json(
        { code: 'ERROR', message: 'ID and comment are required' },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Update the status to 'Rejected' and add the comment
    const [result] = await db.execute(
      'UPDATE update_customer SET status = ?, comment = ?, editby = ?, editat = CURRENT_TIMESTAMP WHERE id = ?',
      ['Rejected', comment, 'admin', id]
    );

    await db.end();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { code: 'ERROR', message: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Request rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json(
      { code: 'ERROR', message: 'Failed to reject request' },
      { status: 500 }
    );
  }
}
