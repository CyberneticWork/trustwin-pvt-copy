import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { contractid, loanType } = body;

    if (!contractid || !loanType) {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "Both contractid and loanType are required"
        }),
        { status: 400 }
      );
    }

    // Establish database connection
    connection = await connectDB();

    let loanDetails = null;

    if (loanType === "Hire Purchase") {
      // Query for Hire Purchase loan details
      const [rows] = await connection.execute(
        `SELECT * FROM auto_loan_applications WHERE contractid = ?`,
        [contractid]
      );

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({
            code: "ERROR",
            message: "No Hire Purchase loan found with the given contractid"
          }),
          { status: 404 }
        );
      }

      const hirePurchaseLoan = rows[0];
      loanDetails = {
        loanType: "Hire Purchase",
        contractid: hirePurchaseLoan.contractid,
        customerId: hirePurchaseLoan.customer_id,
        vehiclePrice: hirePurchaseLoan.vehicle_price,
        downPayment: hirePurchaseLoan.down_payment,
        tradeInValue: hirePurchaseLoan.trade_in_value,
        loanAmount: hirePurchaseLoan.loan_amount,
        loanTermMonths: hirePurchaseLoan.loan_term_months,
        interestRate: hirePurchaseLoan.interest_rate,
        monthlyPayment: hirePurchaseLoan.monthly_payment,
        totalInterest: hirePurchaseLoan.total_interest,
        totalPayable: hirePurchaseLoan.total_payable,
        effectiveRate: hirePurchaseLoan.effective_rate,
        clientReceivingAmount: hirePurchaseLoan.client_receiving_amount,
        status: hirePurchaseLoan.status,
        paymentSchedule: hirePurchaseLoan.payment_schedule,
        residentType: hirePurchaseLoan.residenttype,
        billType: hirePurchaseLoan.billtype,
        comment: hirePurchaseLoan.comment,
        createdAt: formatDate(hirePurchaseLoan.created_at),
        updatedAt: hirePurchaseLoan.updated_at ? formatDate(hirePurchaseLoan.updated_at) : null
      };
    } else if (loanType === "Business Loan") {
      // Query for Business Loan details
      const [rows] = await connection.execute(
        `SELECT * FROM loan_bussiness WHERE contractid = ?`,
        [contractid]
      );

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({
            code: "ERROR",
            message: "No Business Loan found with the given contractid"
          }),
          { status: 404 }
        );
      }

      const businessLoan = rows[0];
      // Generate payment schedule for business loan
      let paymentSchedule = null;
      try {
        if (businessLoan.term && businessLoan.Installment && businessLoan.addat) {
          const scheduleArr = [];
          const startDate = new Date(businessLoan.addat);
          let nPeriods = 1;
          let periodType = 'days';
          let periodValue = 0;
          // Try to extract period and type from term (e.g., '20 days', '12 months')
          const match = String(businessLoan.term).match(/(\d+)\s*(day|month|week|year)s?/i);
          if (match) {
            periodValue = parseInt(match[1], 10);
            periodType = match[2].toLowerCase();
            if (periodType === 'month') nPeriods = periodValue;
            else if (periodType === 'week') nPeriods = periodValue;
            else if (periodType === 'year') nPeriods = periodValue * 12;
            else nPeriods = 1; // For days, single payment
          }
          for (let i = 0; i < nPeriods; i++) {
            let dueDate = new Date(startDate);
            if (periodType === 'month') dueDate.setMonth(dueDate.getMonth() + i);
            else if (periodType === 'week') dueDate.setDate(dueDate.getDate() + i * 7);
            else if (periodType === 'year') dueDate.setMonth(dueDate.getMonth() + i * 12);
            else if (periodType === 'day') dueDate.setDate(dueDate.getDate() + periodValue - 1); // single payment at end
            scheduleArr.push({
              payment_number: i + 1,
              payment_date: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`,
              amount: parseFloat(businessLoan.Installment).toFixed(2),
              status: 'pending',
              partial_amount: null,
              next_payment: i < nPeriods - 1 ? i + 2 : null
            });
            if (periodType === 'day') break;
          }
          paymentSchedule = JSON.stringify({ schedule: scheduleArr });
        }
      } catch (e) {
        paymentSchedule = null;
      }
      loanDetails = {
        loanType: "Business Loan",
        contractid: businessLoan.contractid,
        customerId: businessLoan.customerid,
        vehiclePrice: null,
        downPayment: null,
        tradeInValue: null,
        loanAmount: businessLoan.loanAmount ? parseFloat(businessLoan.loanAmount).toFixed(2) : null,
        loanTermMonths: null,
        interestRate: businessLoan.rate !== undefined ? parseFloat(businessLoan.rate).toFixed(2) : null,
        monthlyPayment: businessLoan.Installment !== undefined ? parseFloat(businessLoan.Installment).toFixed(2) : null,
        totalInterest: null,
        totalPayable: businessLoan.Totalpay !== undefined ? parseFloat(businessLoan.Totalpay).toFixed(2) : null,
        effectiveRate: null,
        clientReceivingAmount: businessLoan.IssueAmmount !== undefined ? parseFloat(businessLoan.IssueAmmount).toFixed(2) : null,
        status: businessLoan.status,
        paymentSchedule: paymentSchedule,
        residentType: businessLoan.residenttype,
        billType: businessLoan.billtype,
        comment: '',
        createdAt: businessLoan.addat ? formatDate(businessLoan.addat) : null,
        updatedAt: null,
        initialPay: businessLoan.initialPay !== undefined ? parseFloat(businessLoan.initialPay).toFixed(2) : null,
        initialPayType: businessLoan.initialPayType || null,
        rateTerm: businessLoan.ratetearm || null,
        CROid: businessLoan.CROid || null,
        Addby: businessLoan.Addby || null,
        term: businessLoan.term || null
      }
    } else {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "Invalid loanType. Must be 'Hire Purchase' or 'Business Loan'"
        }),
        { status: 400 }
      );
    }

    // --- NEW: Fetch payment history from loan_payments ---
    const [paymentRows] = await connection.execute(
      `SELECT * FROM loan_payments WHERE contractid = ? AND status = 'completed' ORDER BY payment_date DESC, id DESC`,
      [contractid]
    );

    // Helper to format date to dd.MM.yyyy
    function formatDate(dateVal) {
      if (!dateVal) return '';
      const d = new Date(dateVal);
      if (isNaN(d)) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }

    // Calculate last payment date/amount, total paid, and map transactions
    let lastPaymentDate = '';
    let lastPaidAmount = '';
    let paidRentalAmount = '0';
    let transactions = [];
    if (paymentRows.length > 0) {
      lastPaymentDate = paymentRows[0].payment_date || '';
      lastPaidAmount = paymentRows[0].amount_paid ? paymentRows[0].amount_paid.toString() : '';
      paidRentalAmount = paymentRows.reduce((sum, row) => sum + parseFloat(row.amount_paid), 0).toString();
      transactions = paymentRows.map(row => ({
        receiptNo: row.transaction_id || '',
        date: row.payment_date || '',
        amount: row.amount_paid ? row.amount_paid.toString() : '',
        type: row.payment_method,
        officer: '', // No officer in this table; can be added if available
        notes: row.notes || ''
      }));
    } else {
      // No payments yet: use contract date as last payment date
      lastPaymentDate = loanDetails.createdAt || loanDetails.addedAt || '';
      lastPaidAmount = '';
      paidRentalAmount = '0';
      transactions = [];
    }

    // Attach payment data to loanDetails (as strings)
    loanDetails.lastPaymentDate = lastPaymentDate;
    loanDetails.lastPaidAmount = lastPaidAmount;
    loanDetails.paidRentalAmount = paidRentalAmount;
    loanDetails.transactions = transactions;

    // --- Defensive: ensure rows exists and has at least one entry ---
    let rawContractStartDate = null;
    try {
      if (loanDetails.loanType === 'Hire Purchase') {
        // Redo the query to get created_at for Hire Purchase
        const [hpRows] = await connection.execute(
          `SELECT created_at FROM auto_loan_applications WHERE contractid = ?`,
          [contractid]
        );
        if (Array.isArray(hpRows) && hpRows[0] && hpRows[0].created_at) {
          rawContractStartDate = hpRows[0].created_at;
        }
      } else if (loanDetails.loanType === 'Business Loan') {
        // Redo the query to get addat for Business Loan
        const [blRows] = await connection.execute(
          `SELECT addat FROM loan_bussiness WHERE contractid = ?`,
          [contractid]
        );
        if (Array.isArray(blRows) && blRows[0] && blRows[0].addat) {
          rawContractStartDate = blRows[0].addat;
        }
      }
    } catch (e) {
      console.error('Error extracting raw contract start date:', e);
      rawContractStartDate = null;
    }

    // --- Calculate total paid amount ---
    let totalPaidAmount = 0;
    if (Array.isArray(paymentRows)) {
      totalPaidAmount = paymentRows.reduce((sum, row) => sum + parseFloat(row.amount_paid || 0), 0);
    }

    // --- Calculate number of due periods (months) from contract start to today ---
    let duePeriods = 0;
    let rental = 0;
    if (loanDetails.loanType === 'Hire Purchase') {
      rental = parseFloat(loanDetails.monthlyPayment || 0);
    } else if (loanDetails.loanType === 'Business Loan') {
      rental = parseFloat(loanDetails.installment || 0);
    }
    if (rawContractStartDate) {
      const start = new Date(rawContractStartDate);
      const today = new Date();
      let tempDuePeriods = 0;
      let termDueDate = new Date(start);
      while (true) {
        let graceDueDate = new Date(termDueDate);
        graceDueDate.setDate(graceDueDate.getDate() + 3);
        if (today > graceDueDate) {
          tempDuePeriods++;
          termDueDate.setMonth(termDueDate.getMonth() + 1);
        } else {
          break;
        }
      }
      duePeriods = tempDuePeriods;
    }

    // --- Calculate total amount should have paid by today ---
    let shouldHavePaidByToday = duePeriods * rental;

    // --- Calculate arrears (simple) ---
    let arrears = shouldHavePaidByToday - totalPaidAmount;

    // --- Attach these values to loanDetails ---
    loanDetails.totalPaidAmount = totalPaidAmount.toFixed(2);
    loanDetails.shouldHavePaidByToday = shouldHavePaidByToday.toFixed(2);
    loanDetails.arrears = arrears.toFixed(2);

    // --- Advanced Arrears Calculation: Payment Schedule + FIFO Payments ---
    let advancedArrears = 0;
    try {
      // 1. Generate payment schedule (monthly)
      let schedule = [];
      let periodCount = 0;
      let scheduleStart = rawContractStartDate ? new Date(rawContractStartDate) : null;
      if (scheduleStart && rental > 0) {
        let today = new Date();
        // Generate due dates up to today
        while (true) {
          let dueDate = new Date(scheduleStart);
          dueDate.setMonth(dueDate.getMonth() + periodCount);
          if (dueDate > today) break;
          schedule.push({ dueDate: new Date(dueDate), amountDue: rental, paid: 0 });
          periodCount++;
        }
      }
      // 2. Sort payments by payment_date
      let payments = Array.isArray(paymentRows) ? paymentRows.slice().sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date)) : [];
      let paymentIdx = 0;
      let paymentLeft = payments.length > 0 ? parseFloat(payments[0].amount_paid) : 0;
      // 3. Apply payments FIFO to schedule
      for (let i = 0; i < schedule.length; i++) {
        let due = schedule[i];
        while (paymentIdx < payments.length && due.paid < due.amountDue) {
          if (paymentLeft <= 0) {
            paymentIdx++;
            if (paymentIdx < payments.length) paymentLeft = parseFloat(payments[paymentIdx].amount_paid);
            else break;
          }
          let toPay = Math.min(due.amountDue - due.paid, paymentLeft);
          due.paid += toPay;
          paymentLeft -= toPay;
        }
      }
      // 4. Sum all unpaid amounts for due rentals as of today
      advancedArrears = schedule.reduce((sum, due) => sum + Math.max(0, due.amountDue - due.paid), 0);
      loanDetails.advancedArrears = advancedArrears.toFixed(2);
    } catch (e) {
      console.error('Error during advanced arrears calculation:', e);
      loanDetails.advancedArrears = '0.00';
    }

    // --- Date fields are sent as raw DB values; frontend will handle formatting ---

    // Return the loan details
    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        message: "Loan details retrieved successfully",
        data: loanDetails
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching loan details:", error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: error.message
      }),
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}