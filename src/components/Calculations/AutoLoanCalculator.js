export function AutoLoanCalculator(principal, rate, months) {
    const monthlyRate = rate / 100 / 12;
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / denominator;
    let breakdown = [];
    let remainingBalance = principal;
    
    for (let i = 1; i <= months; i++) {
        const interest = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        remainingBalance -= principalPayment;
        breakdown.push({ month: i, interest, principalPayment, remainingBalance });
    }
    return { monthlyPayment, breakdown };
}