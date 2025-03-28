export function AutoDraftCalculator(principal, rate, months) {
    const monthlyInterest = (principal * (rate / 100)) / 12;
    return { monthlyInterest };
}