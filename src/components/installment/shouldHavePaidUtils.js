// Utility for 'Should Have Paid By Today' calculation
// If in grace period: shouldHavePaid = arrears + installment
// If not in grace: shouldHavePaid = arrears only

import { parse } from 'date-fns';

export function getArrearsBreakdown({
  contractDateStr,
  rental,
  gracePerMonth = 3,
  monthlyRate = 3,
  currentDate = new Date(),
}) {
  if (!contractDateStr || !rental) return null;
  const [day, month, year] = contractDateStr.split('.');
  const contractDate = new Date(`${year}-${month}-${day}`);
  const today = currentDate;
  const totalDays = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24)) + 1;
  const numMonths = Math.ceil(totalDays / 30);
  const totalGrace = gracePerMonth * numMonths;
  const arrearsDays = Math.max(0, totalDays - totalGrace);
  const totalRentalDue = rental * numMonths;
  const interest = (((monthlyRate / 100) * rental) / 30) * arrearsDays;
  const totalArrears = totalRentalDue + interest;
  return {
    totalDays,
    numMonths,
    totalGrace,
    arrearsDays,
    totalRentalDue,
    interest,
    totalArrears
  };
}

export function calculateShouldHavePaid({
  contractDateStr,
  rental,
  gracePerMonth = 3,
  monthlyRate = 3,
  currentDate = new Date(),
}) {
  if (!contractDateStr || !rental) return 0;
  // Parse contract start date (format: dd.MM.yyyy)
  const [day, month, year] = contractDateStr.split('.');
  const contractDate = new Date(`${year}-${month}-${day}`);
  const today = currentDate;

  // Total days between contract start and today (inclusive)
  const totalDays = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24)) + 1;
  const numMonths = Math.ceil(totalDays / 30);
  const totalGrace = gracePerMonth * numMonths;
  const arrearsDays = Math.max(0, totalDays - totalGrace);
  const totalRentalDue = rental * numMonths;
  const interest = (((monthlyRate / 100) * rental) / 30) * arrearsDays;
  const arrears = totalRentalDue + interest;

  // Fix: Only one rental should be due in the first month, regardless of grace period
  if (numMonths === 1) {
    // If still within grace period, only rental is due (no interest)
    if (arrearsDays === 0) {
      return rental;
    } else {
      // Out of grace, rental plus interest for overdue days
      return rental + interest;
    }
  }

  // For subsequent months, use existing logic
  // Grace window for current month
  const currentMonthDueDate = new Date(contractDate);
  currentMonthDueDate.setMonth(currentMonthDueDate.getMonth() + numMonths);
  const currentGraceEnd = new Date(currentMonthDueDate);
  currentGraceEnd.setDate(currentGraceEnd.getDate() + gracePerMonth);

  if (today <= currentGraceEnd) {
    // In grace period: must pay arrears + this month's installment
    return arrears + rental;
  } else {
    // Not in grace: only arrears
    return arrears;
  }
}
