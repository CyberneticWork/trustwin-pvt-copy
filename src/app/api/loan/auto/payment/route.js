import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['loan_id', 'payment_number', 'payment_date', 'amount_paid', 'payment_method'];
    const missingFields = requiredFields.filter(field => data[field] === undefined);
    
    if (missingFields.length > 0) {
      return Response.json({
        code: "ERROR",
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    const connection = await connectDB();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Get the loan application
      const [loan] = await connection.execute(
        'SELECT * FROM auto_loan_applications WHERE id = ?',
        [data.loan_id]
      );

      if (!loan[0]) {
        throw new Error('Loan not found');
      }

      let paymentSchedule = JSON.parse(loan[0].payment_schedule);
      const currentPayment = paymentSchedule.schedule.find(p => p.payment_number === data.payment_number);

      if (!currentPayment) {
        throw new Error('Payment not found in schedule');
      }

      // Process the payment
      if (data.partial_payment) {
        // Handle partial payment
        currentPayment.status = 'partial';
        currentPayment.partial_amount = data.partial_payment;
        
        // Find next payment and update its amount
        const nextPayment = paymentSchedule.schedule.find(p => p.payment_number === currentPayment.next_payment);
        if (nextPayment) {
          nextPayment.amount += data.partial_payment;
          nextPayment.status = 'pending';
        }
      } else {
        // Handle full payment
        currentPayment.status = 'paid';
        currentPayment.partial_amount = null;
      }

      // Update the payment schedule in the database
      await connection.execute(
        'UPDATE auto_loan_applications SET payment_schedule = ? WHERE id = ?',
        [JSON.stringify(paymentSchedule), data.loan_id]
      );

      // Record the payment
      const [paymentResult] = await connection.execute(
        `INSERT INTO loan_payments (
          loan_id, payment_number, payment_date, amount_paid,
          payment_method, transaction_id, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.loan_id,
          data.payment_number,
          data.payment_date,
          data.amount_paid,
          data.payment_method,
          data.transaction_id || null,
          'completed',
          data.notes || null
        ]
      );

      // Check if loan is completed
      const remainingPayments = paymentSchedule.schedule.filter(p => p.status !== 'paid');
      if (remainingPayments.length === 0) {
        await connection.execute(
          'UPDATE auto_loan_applications SET status = ? WHERE id = ?',
          ['completed', data.loan_id]
        );
      }

      // Commit transaction
      await connection.commit();

      return Response.json({
        code: "SUCCESS",
        message: "Payment processed successfully",
        payment_id: paymentResult.insertId
      });

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error("Error processing payment:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to process payment"
    }, { status: 500 });
  }
}
