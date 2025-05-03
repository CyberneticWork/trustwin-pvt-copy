import { connectDB } from "@/lib/db";

// Function to generate payment schedule
function generatePaymentSchedule(loanAmount, interestRate, loanTermMonths) {
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths) / 
    (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);

  const schedule = [];
  let remainingBalance = loanAmount;

  for (let month = 1; month <= loanTermMonths; month++) {
    const interestAmount = remainingBalance * monthlyInterestRate;
    const principalAmount = monthlyPayment - interestAmount;
    remainingBalance -= principalAmount;

    schedule.push({
      paymentDate: new Date(Date.now() + (month * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      paymentAmount: parseFloat(monthlyPayment.toFixed(2)),
      principalAmount: parseFloat(principalAmount.toFixed(2)),
      interestAmount: parseFloat(interestAmount.toFixed(2)),
      remainingBalance: parseFloat(remainingBalance.toFixed(2))
    });
  }

  return schedule;
}

export async function POST(req) {
  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['customer_id', 'vehicle_price', 'down_payment', 'loan_amount', 'loan_term_months', 
                           'interest_rate', 'monthly_payment', 'total_interest', 'total_payable', 'effective_rate',
                           'client_receiving_amount'];
    
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
      // Check if required tables exist
      const [tables] = await connection.execute(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME IN ('auto_loan_applications', 'initial_charges', 'payment_schedule', 'loan_payments')`
      );

      const requiredTables = ['auto_loan_applications', 'initial_charges', 'payment_schedule', 'loan_payments'];
      const missingTables = requiredTables.filter(table => !tables.some(t => t.TABLE_NAME === table));

      if (missingTables.length > 0) {
        throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
      }

      // Insert into auto_loan_applications
      const [loanResult] = await connection.execute(
        `INSERT INTO auto_loan_applications (
          customer_id, vehicle_price, down_payment, trade_in_value, loan_amount,
          loan_term_months, interest_rate, monthly_payment, total_interest,
          total_payable, effective_rate, client_receiving_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.customer_id,
          data.vehicle_price,
          data.down_payment,
          data.trade_in_value || 0,
          data.loan_amount,
          data.loan_term_months,
          data.interest_rate,
          data.monthly_payment,
          data.total_interest,
          data.total_payable,
          data.effective_rate,
          data.client_receiving_amount,
          'pending'
        ]
      );

      const loanId = loanResult.insertId;

      // Insert initial charges if present
      if (data.initial_charges) {
        await connection.execute(
          `INSERT INTO initial_charges (
            loan_id, service_charges, document_charges, rmv_charges, insurance_premium,
            introducer_commission, other_charges, total_charges, charges_option
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanId,
            data.initial_charges.service_charges,
            data.initial_charges.document_charges,
            data.initial_charges.rmv_charges,
            data.initial_charges.insurance_premium,
            data.initial_charges.introducer_commission,
            data.initial_charges.other_charges,
            data.initial_charges.total_charges,
            data.initial_charges.charges_option
          ]
        );
      }

      // Generate payment schedule
      const paymentSchedule = generatePaymentSchedule(data.loan_amount, data.interest_rate, data.loan_term_months);
      
      // Store payment schedule as JSON
      const paymentScheduleJSON = {
        schedule: paymentSchedule.map((payment, index) => ({
          payment_number: index + 1,
          payment_date: payment.paymentDate,
          amount: payment.paymentAmount,
          status: 'pending',
          partial_amount: null,
          next_payment: index + 2  // Set next payment number
        }))
      };

      // Update the loan application with payment schedule
      await connection.execute(
        'UPDATE auto_loan_applications SET payment_schedule = ? WHERE id = ?',
        [JSON.stringify(paymentScheduleJSON), loanId]
      );

      // Commit transaction
      await connection.commit();

      return Response.json({
        code: "SUCCESS",
        message: "Loan application created successfully",
        loan_id: loanId
      });

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error("Error creating loan application:", error);
    return Response.json({
      code: "ERROR",
      message: "Failed to create loan application"
    }, { status: 500 });
  }
}
