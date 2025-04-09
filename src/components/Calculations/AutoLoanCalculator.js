/**
 * Auto Loan Calculator with Amortization
 * Calculates auto loan details including amortization schedule
 */
export const AutoLoanCalculator = (
    principal,          // Car price - down payment
    rate,               // Annual interest rate (percentage)
    term,               // Loan term in months
    downPayment = 0,    // Down payment amount
    salesTax = 0,       // Sales tax percentage
    otherFees = 0,      // Registration, doc fees, etc.
    tradeInValue = 0    // Trade-in value of another vehicle
  ) => {
    // Convert inputs to numbers to ensure proper calculation
    const vehiclePrice = Number(principal);
    const downPaymentAmount = Number(downPayment);
    const tradeInAmount = Number(tradeInValue);
    const otherFeesAmount = Number(otherFees);
    const annualInterestRate = Number(rate);
    const loanTermMonths = Number(term);
    
    // Calculate sales tax amount (tax is applied on vehicle price minus trade-in in most states)
    const salesTaxRate = Number(salesTax) / 100;
    const salesTaxAmount = (vehiclePrice - tradeInAmount) * salesTaxRate;
    
    // Calculate total amount to be financed
    const amountFinanced = (vehiclePrice - downPaymentAmount - tradeInAmount) + salesTaxAmount + otherFeesAmount;
    
    // Convert annual rate to monthly
    const monthlyRate = annualInterestRate / 100 / 12;
    
    // Calculate monthly payment using amortization formula
    const monthlyPayment = monthlyRate === 0 
      ? amountFinanced / loanTermMonths 
      : (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    
    // Generate amortization schedule
    const amortizationSchedule = [];
    let remainingBalance = amountFinanced;
    let totalInterest = 0;
    
    for (let month = 1; month <= loanTermMonths; month++) {
      // Calculate interest and principal for this payment
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      // Update remaining balance
      remainingBalance -= principalPayment;
      
      // Add to total interest
      totalInterest += interestPayment;
      
      // Add to amortization schedule
      amortizationSchedule.push({
        paymentNumber: month,
        paymentAmount: monthlyPayment,
        principalPayment: principalPayment,
        interestPayment: interestPayment,
        remainingBalance: Math.max(0, remainingBalance), // Avoid negative due to rounding
        totalInterest: totalInterest
      });
    }
    
    // Calculate total loan cost
    const totalLoanCost = monthlyPayment * loanTermMonths;
    
    // Return all calculated values
    return {
      vehiclePrice: vehiclePrice,
      downPayment: downPaymentAmount,
      tradeInValue: tradeInAmount,
      salesTaxAmount: salesTaxAmount,
      otherFees: otherFeesAmount,
      amountFinanced: amountFinanced,
      monthlyPayment: monthlyPayment,
      totalInterest: totalInterest,
      totalLoanCost: totalLoanCost,
      annualInterestRate: annualInterestRate,
      loanTermMonths: loanTermMonths,
      amortizationSchedule: amortizationSchedule
    };
  };