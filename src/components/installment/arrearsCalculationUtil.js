// Utility function for arrears calculation logic (extracted from ArrearsCalculation component)

/**
 * Calculates arrears breakdown and values
 * @param {Object} params
 *   frequency: string ('monthly', 'weekly', etc.)
 *   startDate: string (DD.MM.YYYY)
 *   dueAmount: number|string
 *   currentDate: Date|string|null
 *   interestRates: { monthlyRate: number, gracePeriodDays: number }
 * @returns {Object} { arrearsAmount, missedPeriods, totalArrearsDays, interestAmount, breakdown }
 */
export function calculateArrears({ frequency, startDate, dueAmount, currentDate, interestRates }) {
  // Helper: Parse DD.MM.YYYY to Date
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  if (!startDate || !dueAmount) {
    return {
      arrearsAmount: 0,
      missedPeriods: 0,
      totalArrearsDays: 0,
      interestAmount: 0,
      breakdown: []
    };
  }
  const rental = parseFloat(dueAmount);
  const monthlyRate = parseFloat(interestRates.monthlyRate);
  const gracePerMonth = parseInt(interestRates.gracePeriodDays);
  const today = currentDate ? new Date(currentDate) : new Date();
  today.setHours(0, 0, 0, 0);
  const contractStart = parseDate(startDate);

  // Calculate overdue periods (terms) with per-term grace and overdue days
  let overduePeriods = 0;
  let totalOverdueDays = 0;
  let termDueDate = new Date(contractStart);
  let lastCountedPeriod = null;
  while (true) {
    let graceDueDate = new Date(termDueDate);
    graceDueDate.setDate(graceDueDate.getDate() + gracePerMonth);
    if (today > graceDueDate) {
      overduePeriods++;
      lastCountedPeriod = new Date(termDueDate);
      // Calculate days overdue for this term
      let nextTermDueDate = new Date(termDueDate);
      nextTermDueDate.setMonth(nextTermDueDate.getMonth() + 1);
      let overdueEnd = today < nextTermDueDate ? today : nextTermDueDate;
      let daysOverdue = Math.floor((overdueEnd - graceDueDate) / (1000 * 60 * 60 * 24));
      totalOverdueDays += Math.max(0, daysOverdue);
      termDueDate.setMonth(termDueDate.getMonth() + 1);
    } else {
      break;
    }
  }

  // Only count periods FULLY overdue (after grace). Do NOT include current period's rental if not overdue.
  const totalRentalDue = rental * overduePeriods;
  const interest = (((monthlyRate / 100) * rental) / 30) * totalOverdueDays;
  const totalArrears = totalRentalDue + interest;

  // Breakdown for UI
  const breakdownArr = [
    { label: 'Overdue Periods', value: overduePeriods },
    { label: 'Total Overdue Days', value: totalOverdueDays },
    { label: 'Rentals Due', value: `LKR ${totalRentalDue.toLocaleString(undefined, {minimumFractionDigits:2})}` },
    { label: 'Interest', value: `LKR ${interest.toLocaleString(undefined, {minimumFractionDigits:2})}` },
    { label: 'Total Arrears', value: `LKR ${totalArrears.toLocaleString(undefined, {minimumFractionDigits:2})}` }
  ];

  return {
    arrearsAmount: parseFloat(totalArrears.toFixed(2)),
    missedPeriods: overduePeriods,
    totalArrearsDays: totalOverdueDays,
    interestAmount: parseFloat(interest.toFixed(2)),
    breakdown: breakdownArr
  };
}
