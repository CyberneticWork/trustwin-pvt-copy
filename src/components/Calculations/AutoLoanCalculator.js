// components/Calculations/AutoLoanCalculator.js

/**
 * Auto Loan Calculator using Amortization method
 * Calculates payments, interest, and amortization schedule for an auto loan
 * 
 * @param {number} loanAmount - Total amount to be financed
 * @param {number} interestRate - Annual interest rate (in percentage)
 * @param {number} loanTerm - Loan term in months
 * @param {string} paymentFrequency - Payment frequency ('monthly' only for auto loans)
 * @param {string} interestRateType - Type of interest rate ('yearly' is standard for auto loans)
 * @param {number} serviceCharge - Any service charges (kept for compatibility)
 * @param {number} initialCharges - Total initial charges
 * @param {string} initialChargesOption - How to handle initial charges ('capitalizeCharges', 'clientPay', 'withdrawFromCapital')
 * @returns {object} Calculation results including payment amount, total interest, amortization schedule
 */
export function AutoLoanCalculator(
  loanAmount,
  interestRate,
  loanTerm,
  paymentFrequency = 'monthly',
  interestRateType = 'yearly',
  serviceCharge = 0,
  initialCharges = 0,
  initialChargesOption = 'capitalizeCharges'
) {
  // Adjust loan amount based on how initial charges are applied
  let adjustedLoanAmount = loanAmount;
  let initialPayment = initialCharges;

  // Handle initial charges based on option
  if (initialCharges > 0) {
    if (initialChargesOption === 'capitalizeCharges') {
      // Add the charges to the loan amount
      adjustedLoanAmount += initialCharges;
    } else if (initialChargesOption === 'withdrawFromCapital') {
      // Amount is already deducted from client receiving amount, no change to loan amount
    }
    // For 'clientPay', charges are paid separately, so loan amount stays the same
  }

  // Convert annual interest rate to monthly rate
  let monthlyInterestRate = interestRate;
  if (interestRateType === 'yearly') {
    monthlyInterestRate = interestRate / 12 / 100;
  } else {
    // If interest rate is already monthly
    monthlyInterestRate = interestRate / 100;
  }

  // Calculate monthly payment using the amortization formula
  const monthlyPayment = 
    adjustedLoanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) / 
    (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
  
  // Build amortization schedule
  let balance = adjustedLoanAmount;
  let totalInterest = 0;
  const amortizationSchedule = [];

  for (let period = 1; period <= loanTerm; period++) {
    // Calculate interest for this period
    const interestPayment = balance * monthlyInterestRate;
    
    // Calculate principal for this period
    const principalPayment = monthlyPayment - interestPayment;
    
    // Update balance
    balance -= principalPayment;
    if (balance < 0.01) balance = 0; // Fix rounding issues
    
    // Update total interest
    totalInterest += interestPayment;
    
    // Add to amortization schedule
    amortizationSchedule.push({
      period,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: balance
    });
  }

  // Calculate total amount paid over the life of the loan
  const totalPaid = monthlyPayment * loanTerm;
  
  // Return calculation results
  return {
    payment: monthlyPayment,
    totalInterest: totalInterest,
    totalPrincipal: adjustedLoanAmount,
    totalPayable: totalPaid,
    initialPayment: initialPayment,
    totalPaymentPeriods: loanTerm,
    amortizationSchedule: amortizationSchedule,
    daysPerPeriod: 30, // Approximation for monthly payments
    effectiveRate: (totalInterest / adjustedLoanAmount) * 100,
    loanAmount: adjustedLoanAmount
  };
}

/**
 * Get payment amount for a specific loan amount (per $1000 borrowed)
 * Useful for quick estimates
 * 
 * @param {number} interestRate - Annual interest rate
 * @param {number} loanTerm - Loan term in months
 * @returns {number} Payment amount per $1000 borrowed
 */
export function getPaymentPer1000(interestRate, loanTerm) {
  return AutoLoanCalculator(1000, interestRate, loanTerm).payment;
}

/**
 * Calculate the maximum loan amount a borrower can afford given their desired monthly payment
 * 
 * @param {number} desiredPayment - Desired monthly payment amount
 * @param {number} interestRate - Annual interest rate
 * @param {number} loanTerm - Loan term in months
 * @returns {number} Maximum affordable loan amount
 */
export function getAffordableLoanAmount(desiredPayment, interestRate, loanTerm) {
  const paymentPer1000 = getPaymentPer1000(interestRate, loanTerm);
  return (desiredPayment / paymentPer1000) * 1000;
}

/**
 * Generates a partial amortization schedule (first few and last few payments)
 * Useful for displaying a preview without generating the entire schedule
 * 
 * @param {Array} fullSchedule - Full amortization schedule
 * @param {number} previewCount - Number of periods to include from start and end
 * @returns {Array} Partial schedule with indicators for skipped periods
 */
export function getAmortizationPreview(fullSchedule, previewCount = 3) {
  if (fullSchedule.length <= previewCount * 2) {
    return fullSchedule;
  }
  
  const firstPeriods = fullSchedule.slice(0, previewCount);
  const lastPeriods = fullSchedule.slice(-previewCount);
  
  return [
    ...firstPeriods,
    { isSkipped: true, skippedCount: fullSchedule.length - (previewCount * 2) },
    ...lastPeriods
  ];
}

/**
 * Calculate early payoff savings
 * 
 * @param {Array} amortizationSchedule - Full amortization schedule
 * @param {number} payoffPeriod - Period after which the loan will be paid off early
 * @returns {object} Savings information including interest saved and new total paid
 */
export function calculateEarlyPayoffSavings(amortizationSchedule, payoffPeriod) {
  if (payoffPeriod >= amortizationSchedule.length) {
    return { interestSaved: 0, newTotalPaid: 0 };
  }
  
  const remainingBalance = amortizationSchedule[payoffPeriod - 1].balance;
  let paidSoFar = 0;
  
  // Calculate how much has been paid so far
  for (let i = 0; i < payoffPeriod; i++) {
    paidSoFar += amortizationSchedule[i].payment;
  }
  
  // Calculate total with normal payment schedule
  const totalWithFullTerm = amortizationSchedule.reduce((sum, period) => sum + period.payment, 0);
  
  // Calculate new total with early payoff
  const newTotalPaid = paidSoFar + remainingBalance;
  
  // Calculate interest saved
  const interestSaved = totalWithFullTerm - newTotalPaid;
  
  return {
    interestSaved,
    newTotalPaid,
    remainingBalance
  };
}
