// app/loan-info/installments/[contraID]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrentArrearsValue from "@/components/installment/CurrentArrearsValue";
import { calculateArrears } from "@/components/installment/arrearsCalculationUtil";
import PaymentPopupCard from "@/components/installment/PaymentPopupCard";
import ReceiptGenerator from "@/components/installment/ReceiptGenerator";
import TransactionHistoryTable from "@/components/installment/TransactionHistoryTable";
import LoanSummaryDashboard from "@/components/installment/LoanSummaryDashboard";
import { calculateShouldHavePaid } from "@/components/installment/shouldHavePaidUtils";

export default function InstallmentPage() {
  // ...existing states...
  const [settlementSummary, setSettlementSummary] = useState(null);
  const { contraID } = useParams();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);  
  const [receiptData, setReceiptData] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [facilityData, setFacilityData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dueRental, setDueRental] = useState(0);
  const [advancedArrears, setAdvancedArrears] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [comments, setComments] = useState([
    {
      author: "Avishka Avishka",
      date: "02.10.2024",
      text: "Customer requested a payment extension due to temporary financial difficulty.",
      timestamp: "10:24 AM"
    },
    {
      author: "Avishka Avishka",
      date: "04.10.2024",
      text: "Follow-up call made. Customer confirmed payment will be made by 05.10.2024.",
      timestamp: "02:15 PM"
    }
  ]);
  const [newComment, setNewComment] = useState("");
  const [arrearsBreakdown, setArrearsBreakdown] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState({ totalPaid: 0, lastPaidAmount: 0, lastPaidDate: null });

  // --- Helper Functions ---

  /**
   * Convert 'YYYY-MM-DD HH:mm:ss' to 'DD.MM.YYYY'
   * @param {string} dbDate - Date string from DB
   * @returns {string} DD.MM.YYYY
   */
  function formatDbDateToDisplay(dbDate) {
    if (!dbDate) return '';
    // Accepts 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss'
    const [datePart] = dbDate.split(' ');
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return dbDate;
    return `${day}.${month}.${year}`;
  }

  /**
   * Scenario-based calculation logic (from user pseudocode)
   *
   * @param {number} arrears - The current arrears amount ("areas" in pseudocode)
   * @param {number} userEnterAmount - The amount entered by the user ("userenteramount")
   * @param {number} rental - The rental amount ("rental")
   * @returns {{arrears: number, hold: number, rental: number}}
   */
  function scenarioBasedCalculation(arrears, userEnterAmount, rental) {
    let hold = 0;
    // Step 1: If arrears > userEnterAmount
    if (arrears > userEnterAmount) {
      hold = 0;
      arrears = arrears - userEnterAmount;
    } else if (userEnterAmount >= arrears) {
      // Step 2: If userEnterAmount >= arrears
      hold = userEnterAmount - arrears;
      arrears = 0;
      if (rental !== 0) {
        if (hold > 0) {
          if (hold > rental) {
            hold = hold - rental;
          } else if (hold < rental) {
            rental = rental - hold;
            hold = 0;
          } else {
            // hold === rental
            hold = 0;
            rental = 0;
          }
        }
      }
    }
    return { arrears, hold, rental };
  }
  // --- Example usage ---
  // const { arrears: newArrears, hold: newHold, rental: newRental } = scenarioBasedCalculation(currentArrears, userEnteredAmount, currentRental);

  const parseAmount = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/,/g, ''));
  };
  const getRentalAmount = (rentalString) => {
    if (!rentalString) return 0;
    const amountPart = rentalString.split(" ")[0];
    return parseAmount(amountPart);
  };
  const getPaymentFrequency = () => {
    const termLower = facilityData ? facilityData.group1.term.toLowerCase() : '';
    if (termLower.includes('daily')) return "daily";
    if (termLower.includes('weekly')) return "weekly";
    return "monthly";
  };

  // --- Calculate today's required payment (frontend only, for display) ---
  const calculateTodayDue = () => {
    if (!facilityData) return 0;
    const rental = getRentalAmount(facilityData.group1.rental);
    const contractDateStr = facilityData.group1.contractDate;
    if (!rental || !contractDateStr) return 0;
    // You can make gracePerMonth and monthlyRate dynamic if needed
    return calculateShouldHavePaid({
      contractDateStr,
      rental,
      gracePerMonth: 3,
      monthlyRate: 3,
      currentDate: new Date(),
    });
  };

  // --- Use paymentSummary state for Total Paid and Last Paid Amount ---
  const calculateTotalPaid = () => parseFloat(paymentSummary.totalPaid || 0);
  const getLastPaidAmount = () => parseFloat(paymentSummary.lastPaidAmount || 0);

  // --- Calculate Due Rental (with correct business logic) ---
  useEffect(() => {
    if (!facilityData) {
      setDueRental(0);
      setAdvancedArrears(0);
      setTotalOutstanding(0);
      return;
    }
    const rental = getRentalAmount(facilityData.group1.rental);
    const arrearsResult = calculateArrears({
      frequency: getPaymentFrequency(),
      startDate: facilityData.group1.contractDate,
      dueAmount: rental,
      currentDate: null,
      interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
    });
    const arrears = arrearsResult.arrearsAmount;
    setAdvancedArrears(arrears);
    const totalPaid = calculateTotalPaid();
    let remainingAfterArrears = totalPaid - arrears;
    let dueRentalVal = rental;
    if (remainingAfterArrears > 0) {
      dueRentalVal = Math.max(0, rental - remainingAfterArrears);
    }
    setDueRental(dueRentalVal);
    setTotalOutstanding(arrears + dueRentalVal);
  }, [facilityData, calculateTotalPaid, getPaymentFrequency]);

// --- Calculate Hold Amount (using scenario-based calculation) ---
  const calculateHoldAmount = () => {
    if (!facilityData) return 0;
    const arrears = advancedArrears; // from state
    const totalPaid = parseFloat(paymentSummary.totalPaid || 0);
    const rental = getRentalAmount(facilityData.group1.rental);
    const { hold } = scenarioBasedCalculation(arrears, totalPaid, rental);
    return hold;
  };


  // --- Calculate Total Outstanding as per business rule ---
  const calculateOutstanding = () => {
    if (!facilityData) return 0;
    // Get arrearsAmount (current arrears) from arrears calculation
    const rental = getRentalAmount(facilityData.group1.rental);
    // You may have advancedArrears or a similar variable from arrearsCalculationUtil
    const arrearsAmount = advancedArrears || 0; // fallback to 0 if not available // advancedArrears is now from state
    if (arrearsAmount > 0) {
      return arrearsAmount + rental;
    } else {
      return rental;
    }
  };

  // --- Fetch loan data and map to state ---
  useEffect(() => {
    // Fetch settlement summary from API
    const fetchSettlementSummary = async () => {
      if (!contraID) return;
      try {
        const res = await fetch('/api/payments/settlement-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractid: contraID })
        });
        const data = await res.json();
        if (data.code === 'SUCCESS') {
          console.log(data);
          setSettlementSummary(data.data);
        } else {
          setSettlementSummary(null);
        }
      } catch (e) {
        setSettlementSummary(null);
      }
    };
    fetchSettlementSummary();

    // Fetch arrears breakdown
    const fetchArrearsBreakdown = async () => {
      if (!contraID) return;
      try {
        const res = await fetch('/api/loan/installment/arrearsdays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractid: contraID })
        });
        const data = await res.json();
        if (data.code === 'SUCCESS') {
          setArrearsBreakdown(data.data);
        } else {
          setArrearsBreakdown(null);
        }
      } catch (e) {
        setArrearsBreakdown(null); 
      }
    };
    fetchArrearsBreakdown();

    // Fetch payment summary for this contract
    const fetchPaymentSummary = async () => {
      if (!contraID) return;
      try {
        const res = await fetch('/api/loan/installment/paymentsummary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractid: contraID })
        });
        const data = await res.json();
        if (data.code === 'SUCCESS') {
          setPaymentSummary(data.data);
        }
      } catch (e) { /* ignore */ }
    };
    fetchPaymentSummary();

    // Existing loan data fetch
    const fetchLoanData = async () => {
      if (!contraID) return;
      let loanType = 'Unknown Loan Type';
      if (contraID && typeof contraID === 'string') {
        if (contraID.includes('MB')) loanType = 'Hire Purchase';
        if (contraID.includes('BL')) loanType = 'Business Loan';
      }
      try {
        const response = await fetch('/api/loan/installment/loaddata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractid: contraID, loanType })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.code === 'SUCCESS') {
          const api = data.data;
          
          // Fetch customer data using the customer ID from loan data
          if (api.customerId) {
            try {
              const customerResponse = await fetch(`/api/customer/data?customerId=${api.customerId}`);
              const customerData = await customerResponse.json();
              
              if (customerData.code === 'SUCCESS') {
                setPersonalInfo({
                  name: customerData.data.customerName || '',
                  nic: customerData.data.customerNic || '',
                  gender: customerData.data.customerGender || '',
                  civilStatus: customerData.data.customerCivilStatus || '',
                  dob: customerData.data.customerDob || '',
                  address: customerData.data.customerAddress || '',
                  mobile: customerData.data.customerMobile || '',
                  product: api.product || '',
                  productType: api.productType || '',
                  location: customerData.data.location || '',
                  marketingOfficer: api.marketingOfficer || ''
                });
              } else {
                console.error('Error fetching customer data:', customerData.message);
                // Fallback to loan data if customer data fetch fails
                setPersonalInfo({
                  name: api.customerName || '',
                  nic: api.customerNic || '',
                  gender: api.customerGender || '',
                  civilStatus: api.customerCivilStatus || '',
                  dob: api.customerDob || '',
                  address: api.customerAddress || '',
                  mobile: api.customerMobile || '',
                  product: api.product || '',
                  productType: api.productType || '',
                  location: api.location || '',
                  marketingOfficer: api.marketingOfficer || ''
                });
              }
            } catch (error) {
              console.error('Error fetching customer data:', error);
              // Fallback to loan data if customer data fetch fails
              setPersonalInfo({
                name: api.customerName || '',
                nic: api.customerNic || '',
                gender: api.customerGender || '',
                civilStatus: api.customerCivilStatus || '',
                dob: api.customerDob || '',
                address: api.customerAddress || '',
                mobile: api.customerMobile || '',
                product: api.product || '',
                productType: api.productType || '',
                location: api.location || '',
                marketingOfficer: api.marketingOfficer || ''
              });
            }
          }

          setFacilityData({
            group1: {
              contractNo: api.contractid || '',
              contractDate: formatDbDateToDisplay(api.createdAt || api.addedAt || ''),
              facilityAmount: api.totalPayable || '',
              term: api.loanTermMonths ? `${api.loanTermMonths} Monthly` : (api.term ? `${api.term} Monthly` : ''),
              dueDate: api.dueDate || '',
              contractStatus: api.status || '',
              rental: api.monthlyPayment || api.installment || '',
              agreedAmount: api.agreedAmount || '',
              arrearsAge: api.arrearsAge || '',
              dueDate2: api.dueDate2 || '',
              monthlyInterestRate: api.interestRate || api.rate || '',
              mustPaidToToday: api.shouldHavePaidByToday || '',
            },
            group2: {
              lastPaymentDate: api.lastPaymentDate || '',
              lastPaidAmount: api.lastPaidAmount || '',
              totalArrears: api.arrears || '',
              paidRentals: api.paidRentals || '',
              dueRentals: api.dueRentals || '',
              totalOutstanding: api.totalOutstanding || '',
              defaultInterest: api.defaultInterest || '',
              paidRentalAmount: api.totalPaidAmount || '',
              totalPaidAmount: api.totalPaidAmount || '',
            },
            group3: {
              settlementAmount: api.settlementAmount || '',
              futureCapital: api.futureCapital || '',
              futureInterest: api.futureInterest || '',
              closingDate: api.closingDate || '',
              paidCapital: api.paidCapital || '',
              paidInterest: api.paidInterest || '',
              facilityAmount2: api.facilityAmount2 || '',
              capitalAmount: api.capitalAmount || '',
              totalInterest: api.totalInterest || ''
            },
            payshedule:{
              schedule: api.paymentSchedule || ''
            }
          });

          // Fetch transactions from the new GET API endpoint
          const fetchTransactions = async () => {
            if (!contraID) return;
            try {
              const res = await fetch(`/api/loan/installment/transactions_full?contractid=${encodeURIComponent(contraID)}`);
              const data = await res.json();
              if (data.code === 'SUCCESS') {
                setTransactions(Array.isArray(data.data) ? data.data : []);
              } else {
                setTransactions([]);
              }
            } catch (e) {
              setTransactions([]);
            }
          };
          fetchTransactions();
        } else {
          setPersonalInfo(null);
          setFacilityData(null);
        }
      } catch (error) {
        setPersonalInfo(null);
        setFacilityData(null);
        console.error('Error fetching loan data:', error);
      }
    };
    fetchLoanData();
  }, [contraID]);

  // --- Payment Submission Logic ---
  const handlePaymentSubmit = (paymentData) => {
    if (!paymentData) {
      setIsPaymentModalOpen(false);
      return;
    }
    // After payment, always reload from backend for authoritative values
    setIsPaymentModalOpen(false);
    setShowReceipt(false);
    setReceiptData(null);
    setTimeout(() => {
      window.location.reload(); // Ensures latest values; can be improved to just refetch
    }, 500);
  };

  // --- Comment Submission ---
  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, '.');
    const timeStr = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setComments([...comments, { author: "Current User", date: dateStr, text: newComment, timestamp: timeStr }]);
    setNewComment("");
  };

  // --- UI ---
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Personal Information Card */}
      <Card className="overflow-hidden shadow-lg mb-4">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gray-800 p-3 md:w-1/4">
            <h2 className="text-xl text-gray-100">{personalInfo ? personalInfo.name : ''}</h2>
            <p className="text-sm text-gray-300">NIC | {personalInfo ? personalInfo.nic : ''}</p>
          </div>
          <div className="p-3 flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              <div><span className="text-xs text-gray-500">Gender</span><p className="font-medium">{personalInfo ? personalInfo.gender : ''}</p></div>
              <div><span className="text-xs text-gray-500">Civil Status</span><p className="font-medium">{personalInfo ? personalInfo.civilStatus : ''}</p></div>
              <div><span className="text-xs text-gray-500">DOB</span><p className="font-medium">{personalInfo ? personalInfo.dob : ''}</p></div>
              <div><span className="text-xs text-gray-500">Mobile</span><p className="font-medium">{personalInfo ? personalInfo.mobile : ''}</p></div>
              <div><span className="text-xs text-gray-500">Address</span><p className="font-medium">{personalInfo ? personalInfo.address : ''}</p></div>
              <div><span className="text-xs text-gray-500">Product</span><p className="font-medium">{personalInfo ? personalInfo.product : ''}</p></div>
              <div><span className="text-xs text-gray-500">Product Type</span><p className="font-medium">{personalInfo ? personalInfo.productType : ''}</p></div>
              <div><span className="text-xs text-gray-500">Location</span><p className="font-medium">{personalInfo ? personalInfo.location : ''}</p></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Loan Summary Dashboard */}
      <div className="mb-4">
        <LoanSummaryDashboard
          facilityAmount={facilityData ? parseAmount(facilityData.group1.facilityAmount) : 0}
          paidAmount={facilityData ? parseAmount(facilityData.group2.totalPaidAmount) : 0}
          outstandingBalance={facilityData ? parseAmount(facilityData.group2.totalOutstanding) : 0}
          arrears={Math.max(0, facilityData ? parseAmount(facilityData.group2.totalArrears) : 0)}
          dueRentals={facilityData ? parseInt(facilityData.group2.dueRentals) : 0}
          paidRentals={facilityData ? parseInt(facilityData.group2.paidRentals) : 0}
          interest={facilityData ? parseAmount(facilityData.group3.totalInterest) : 0}
          capital={facilityData ? parseAmount(facilityData.group3.capitalAmount) : 0}
          contractStatus={facilityData ? facilityData.group1.contractStatus : ''}
          lastPaymentDate={facilityData ? facilityData.group2.lastPaymentDate : ''}
          nextDueDate={facilityData ? facilityData.group1.dueDate : ''}
          contractNumber={facilityData ? facilityData.group1.contractNo : ''}
        />
      </div>

      {/* Facility Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Card 1: Contract Details */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Contract Details</h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="text-xs text-gray-500">Contract No</span><p className="font-medium">{facilityData ? facilityData.group1.contractNo : ''}</p></div>
              <div>
                <span className="text-xs text-gray-500">Contract Date <span className="text-[10px] text-gray-400">(DD.MM.YYYY)</span></span>
                <p className="font-medium">{facilityData ? formatDbDateToDisplay(facilityData.group1.contractDate) : ''}</p>
              </div>
              <div><span className="text-xs text-gray-500">Facility Amount</span><p className="font-medium">LKR {facilityData ? facilityData.group1.facilityAmount : ''}</p></div>
              <div><span className="text-xs text-gray-500">Term</span><p className="font-medium">{facilityData ? facilityData.group1.term : ''}</p></div>
              <div><span className="text-xs text-gray-500">Due Date</span><p className="font-medium">{facilityData ? facilityData.group1.dueDate : ''}</p></div>
              <div><span className="text-xs text-gray-500">Contract Status</span><p className="font-medium text-green-600 bg-green-100 px-1 rounded">{facilityData ? facilityData.group1.contractStatus : ''}</p></div>
              <div><span className="text-xs text-gray-500">Rental</span><p className="font-medium">LKR {facilityData ? facilityData.group1.rental : ''}</p></div>
              <div><span className="text-xs text-gray-500">Agreed Amount</span><p className="font-medium">LKR {facilityData ? facilityData.group1.agreedAmount : ''}</p></div>
              <div><span className="text-xs text-gray-500">Available Amount</span><p className="font-medium text-blue-700 bg-blue-100 px-1 rounded">LKR {facilityData ? facilityData.group1.mustPaidToToday : ''}</p></div>
              <div><span className="text-xs text-gray-500">Last Term</span><p className="font-medium">{(() => {
                 if (!facilityData) return '';
                 const contractDateStr = facilityData.group1.contractDate;
                 const term = facilityData.group1.term || '';
                 if (!contractDateStr) return '';
                 const [day, month, year] = contractDateStr.split('.');
                 const contractDate = new Date(`${year}-${month}-${day}`);
                 const today = new Date();
                 let termNumber = 1;
                 if (term.toLowerCase().includes('daily')) {
                   const diffDays = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24));
                   termNumber = diffDays + 1;
                 } else if (term.toLowerCase().includes('weekly')) {
                   const diffWeeks = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24 * 7));
                   termNumber = diffWeeks + 1;
                 } else {
                   // Default to monthly
                   const diffMonths = (today.getFullYear() - contractDate.getFullYear()) * 12 + (today.getMonth() - contractDate.getMonth());
                   termNumber = diffMonths + 1;
                 }
                 return termNumber;
               })()}</p></div>
            </div>
          </div>
        </Card>
        {/* Card 2: Payment Details */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Payment Details</h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="text-xs text-gray-500">Last Payment Date</span><p className="font-medium">{facilityData ? facilityData.group2.lastPaymentDate : ''}</p></div>
              <div><span className="text-xs text-gray-500">Last Paid Amount</span><p className="font-medium bg-yellow-100 px-1 rounded">LKR {getLastPaidAmount().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p></div>
              <div><span className="text-xs text-gray-500">Total Paid</span><p className="font-medium bg-green-100 px-1 rounded">LKR {calculateTotalPaid().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p></div>
              {/* Calculate current arrears using the utility for authoritative value */}
              {facilityData && (() => {
                const arrears = calculateArrears({
                  frequency: getPaymentFrequency(),
                  startDate: facilityData.group1.contractDate,
                  dueAmount: getRentalAmount(facilityData.group1.rental),
                  currentDate: null,
                  interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
                }).arrearsAmount;
                const totalPaid = calculateTotalPaid();
                const currentArrears = Math.max(0, arrears - totalPaid);
                return <CurrentArrearsValue value={currentArrears} />;
              })()}

              <div><span className="text-xs text-gray-500">Hold Amount</span><p className="font-medium bg-yellow-100 px-1 rounded">LKR {calculateHoldAmount().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p></div>
              <div><span className="text-xs text-gray-500">Due Rentals</span><p className="font-medium bg-blue-100 px-1 rounded">{(() => {
                if (!facilityData) return '0.00';
                const rental = getRentalAmount(facilityData.group1.rental);
                const contractDateStr = facilityData.group1.contractDate;
                if (!contractDateStr) return '0.00';
                const [startDay, startMonth, startYear] = contractDateStr.split('.');
                const contractDate = new Date(`${startYear}-${startMonth}-${startDay}`);
                const today = new Date();
                const gracePeriod = 3; // Or get from interestRates if dynamic
                let showRental = false;

                // Monthly logic: show rental if today is due date or within grace period
                if (getPaymentFrequency() === 'monthly') {
                  const dueDay = contractDate.getDate();
                  const currentDay = today.getDate();
                  // Find the due date for this month
                  let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
                  // If due date is in the future, use previous month's due date
                  if (dueDate > today) {
                    dueDate = new Date(today.getFullYear(), today.getMonth() - 1, dueDay);
                  }
                  const daysSinceDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                  if (daysSinceDue >= 0 && daysSinceDue <= gracePeriod) {
                    showRental = true;
                  }
                }
                // TODO: Add logic for weekly/daily if needed
                if (!showRental) return '0.00';
                // Calculation logic is now handled in useEffect below
                return dueRental.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});

              })()}</p></div>
              <div><span className="text-xs text-gray-500">Total Outstanding</span><p className="font-medium text-red-600 bg-red-100 px-1 rounded">LKR {totalOutstanding.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p></div>
              <div><span className="text-xs text-gray-500">Interest Amount</span><p className="font-medium bg-blue-100 px-1 rounded">LKR {(() => {
                if (!facilityData) return '0.00';
                const result = calculateArrears({
                  frequency: getPaymentFrequency(),
                  startDate: facilityData.group1.contractDate,
                  dueAmount: getRentalAmount(facilityData.group1.rental),
                  currentDate: null,
                  interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
                });
                const totalPaid = calculateTotalPaid();
                const currentArrears = Math.max(0, result.arrearsAmount - totalPaid);
                if (currentArrears === 0) return '0.00';
                
                return result.interestAmount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
              })()}</p></div>
            </div>
          </div>
          {/* Add arrears breakdown fields to Payment Details */}
          {arrearsBreakdown && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-2">
              <div><span className="text-xs text-gray-500">Arrears Days</span><p className="font-medium bg-red-100 px-1 rounded">{arrearsBreakdown.arrearsDays}</p></div>
              <div><span className="text-xs text-gray-500">Grace Days</span><p className="font-medium bg-yellow-100 px-1 rounded">{arrearsBreakdown.graceDays}</p></div>
              <div><span className="text-xs text-gray-500">Total Days</span><p className="font-medium bg-blue-100 px-1 rounded">{arrearsBreakdown.totalDays}</p></div>
            </div>
          )}
          <div className="mt-3 flex justify-end">
            {(() => {
              const remainingAmount = (() => {
                if (!facilityData) return 0;
                // Calculate current arrears using the utility for authoritative value
                const currentArrears = (() => {
                  const arrears = calculateArrears({
                    frequency: getPaymentFrequency(),
                    startDate: facilityData.group1.contractDate,
                    dueAmount: getRentalAmount(facilityData.group1.rental),
                    currentDate: null,
                    interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
                  }).arrearsAmount;
                  const totalPaid = calculateTotalPaid();
                  return Math.max(0, arrears - totalPaid);
                })();

                // Get total term from facility data
                const totalTerm = parseInt(facilityData.group1.term) || 0;
                
                // Calculate last term
                const lastTerm = (() => {
                  if (!facilityData) return 0;
                  const contractDateStr = facilityData.group1.contractDate;
                  if (!contractDateStr) return 0;
                  
                  const [day, month, year] = contractDateStr.split('.');
                  const contractDate = new Date(`${year}-${month}-${day}`);
                  const today = new Date();
                  
                  const frequency = getPaymentFrequency();
                  let completedTerms = 0;
                  
                  if (frequency === 'daily') {
                    completedTerms = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24));
                  } else if (frequency === 'weekly') {
                    completedTerms = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24 * 7));
                  } else {
                    completedTerms = (today.getFullYear() - contractDate.getFullYear()) * 12 + 
                                   (today.getMonth() - contractDate.getMonth());
                  }
                  
                  return Math.max(0, completedTerms);
                })();
                
                // Calculate remaining terms using the exact formula
                const remainingTerms = Math.max(0, totalTerm - lastTerm);
                
                // Calculate remaining amount using the exact formula
                const remainingAmount = currentArrears + (getRentalAmount(facilityData.group1.rental) * remainingTerms);
                
                return remainingAmount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
              })();

              const isLoanOverpaid = remainingAmount === 0;

              return (
                <div className="flex items-center gap-4">
                  {isLoanOverpaid && (
                    <div className="text-green-600 bg-green-100 px-3 py-1 rounded-md text-sm font-medium">
                      Loan Fully Paid
                    </div>
                  )}
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={isLoanOverpaid}
                    className={`text-sm px-3 py-1 rounded text-white font-medium transition-all shadow-md ${
                      isLoanOverpaid 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900'
                    }`}
                  >
                    Make Payment
                  </button>
                </div>
              );
            })()}
          </div>
        </Card>
        {/* Card 3: Settlement Details */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-2 border-b border-gray-200 bg-gray-700">
            <h2 className="text-sm text-gray-100">Settlement Details</h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Total Facility Amount</span>
                <p className="font-medium bg-blue-100 px-1 rounded">
                  LKR {facilityData ? parseAmount(facilityData.group1.facilityAmount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '...'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Interest</span>
                <p className="font-medium bg-purple-100 px-1 rounded">
                  LKR {(() => {
                    if (!facilityData) return '...';
                    const totalFacilityAmount = parseAmount(facilityData.group1.facilityAmount);
                    const paidAmount = parseAmount(facilityData.group2.totalPaidAmount);
                    
                    // Calculate remaining amount
                    const remainingAmount = (() => {
                      // Get current arrears from API
                      const currentArrears = parseAmount(facilityData.group2.totalArrears);
                      const rental = getRentalAmount(facilityData.group1.rental);
                      const totalTerm = parseInt(facilityData.group1.term) || 0;
                      const paidRentals = parseInt(facilityData.group2.paidRentals) || 0;
                      const remainingTerms = Math.max(0, totalTerm - paidRentals);
                      
                      // Calculate total due amount
                      const totalDue = currentArrears + (rental * remainingTerms);
                      
                      // Calculate remaining amount
                      return Math.max(0, totalDue - paidAmount);
                    })();

                    // Calculate total interest using the correct formula
                    const totalInterest = Math.max(0, totalFacilityAmount - (remainingAmount + paidAmount));
                    return totalInterest.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                  })()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Available Rental in Arrears</span>
                <p className="font-medium bg-green-100 px-1 rounded">
                  LKR {(() => {
                    if (!facilityData) return '...';
                    // Calculate current arrears
                    const currentArrears = (() => {
                      const arrears = calculateArrears({
                        frequency: getPaymentFrequency(),
                        startDate: facilityData.group1.contractDate,
                        dueAmount: getRentalAmount(facilityData.group1.rental),
                        currentDate: null,
                        interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
                      }).arrearsAmount;
                      const totalPaid = calculateTotalPaid();
                      return Math.max(0, arrears - totalPaid);
                    })();
                    
                    // Calculate interest amount
                    const interestAmount = (() => {
                      const result = calculateArrears({
                        frequency: getPaymentFrequency(),
                        startDate: facilityData.group1.contractDate,
                        dueAmount: getRentalAmount(facilityData.group1.rental),
                        currentDate: null,
                        interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
                      });
                      return result.interestAmount;
                    })();
                    
                    // Calculate available rental as Current Arrears - Interest Amount
                    const availableRental = Math.max(0, currentArrears - interestAmount);
                    return availableRental.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                  })()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Settlement</span>
                <p className="font-medium bg-red-100 px-1 rounded">
                  LKR {(() => {
                    if (!facilityData || !settlementSummary) return '...';
                    const totalSettlement = parseAmount(settlementSummary.totalSettlement);
                    return totalSettlement.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                  })()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Remaining Amount</span>
                <p className="font-medium bg-yellow-100 px-1 rounded">
                  LKR {(() => {
                    if (!facilityData) return '...';
                    
                    // Get values from API
                    const currentArrears = parseAmount(facilityData.group2.totalArrears);
                    const rental = getRentalAmount(facilityData.group1.rental);
                    
                    // Extract term number from string like "20 days Monthly"
                    const term = (() => {
                      const termStr = facilityData.group1.term || '';
                      const match = termStr.match(/\d+/);
                      return match ? parseInt(match[0]) : 0;
                    })();
                    
                    // Calculate last term
                    const lastTerm = (() => {
                      if (!facilityData) return 0;
                      const contractDateStr = facilityData.group1.contractDate;
                      if (!contractDateStr) return 0;
                      
                      const [day, month, year] = contractDateStr.split('.');
                      const contractDate = new Date(`${year}-${month}-${day}`);
                      const today = new Date();
                      
                      const frequency = getPaymentFrequency();
                      let completedTerms = 0;
                      
                      if (frequency === 'daily') {
                        completedTerms = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24));
                      } else if (frequency === 'weekly') {
                        completedTerms = Math.floor((today - contractDate) / (1000 * 60 * 60 * 24 * 7));
                      } else {
                        completedTerms = (today.getFullYear() - contractDate.getFullYear()) * 12 + 
                                       (today.getMonth() - contractDate.getMonth());
                      }
                      
                      return Math.max(0, completedTerms);
                    })();
                    
                    // Calculate remaining terms using the exact formula
                    const remainingTerms = Math.max(0, term - lastTerm);
                    
                    // Calculate remaining amount using the exact formula
                    const remainingAmount = currentArrears + (rental * remainingTerms);
                    
                    return remainingAmount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                  })()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Paid Amount</span>
                <p className="font-medium bg-green-100 px-1 rounded">
                  LKR {facilityData ? parseAmount(facilityData.group2.totalPaidAmount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '...'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>


      {/* Arrears Calculation (Simulation/What-if only) */}
      {/* <div className="mb-4">
        <ArrearsCalculation 
          frequency={getPaymentFrequency()}
          startDate={facilityData ? facilityData.group1.contractDate : ''}
          dueAmount={getRentalAmount(facilityData ? facilityData.group1.rental : 0)}
          lastPaidDate={facilityData ? facilityData.group2.lastPaymentDate : ''}
          currentDate={null} // Use system date
          interestRates={{ monthlyRate: 3, gracePeriodDays: 3, dailyRate: 0.1, latePaymentPenalty: 5, defaultRate: 24 }}
          onArrearsChange={setAdvancedArrears}
          currentArrears={facilityData ? parseFloat(facilityData.group2.totalArrears) : 0}
        />
        <CurrentArrearsValue value={advancedArrears} />
      </div> */}
      {/* Arrears Breakdown Table */}
      {/* <div className="mb-4">
        <ArrearsBreakdownTable data={arrearsBreakdown} />
      </div> */}

      {/* Tabs for Transaction and Term History */}
      <Tabs defaultValue="transaction" className="mb-4">
        <TabsList className="bg-white shadow rounded-md border border-gray-200">
          <TabsTrigger className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" value="transaction">Transaction</TabsTrigger>
          {facilityData?.group1?.contractNo?.includes('MB') && (
            <TabsTrigger className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" value="termHistory">Amortization</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="transaction">
          <TransactionHistoryTable 
            transactions={transactions} 
            onGenerateStatement={() => {}}
            showGenerateStatement={true}
          />
        </TabsContent>
        {facilityData?.group1?.contractNo?.includes('MB') && (
          <TabsContent value="termHistory">
            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      try {
                        const schedule = JSON.parse(facilityData["payshedule"].schedule|| '{"schedule":[]}').schedule;
                        // console.log(facilityData["payshedule"].schedule);
                        console.log(schedule);
                        return schedule.map((term, index) => (
          
                          <tr key={index} className={term.status === 'paid' ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{term.payment_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(term.payment_date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }).replace(/\//g, '.')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              LKR {parseFloat(term.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {term.next_payment || '-'}
                            </td>
                          </tr>
                        ));
                      } catch (error) {
                        console.error('Error parsing payment schedule:', error);
                        return (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              No payment schedule available
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Payment Modal */}
      <PaymentPopupCard
        open={isPaymentModalOpen}
        onClose={handlePaymentSubmit}
        rentalAmount={getRentalAmount(facilityData ? facilityData.group1.rental : 0)}
        arrearsAmount={(() => {
          if (!facilityData) return 0;
          const arrears = calculateArrears({
            frequency: getPaymentFrequency(),
            startDate: facilityData.group1.contractDate,
            dueAmount: getRentalAmount(facilityData.group1.rental),
            currentDate: null,
            interestRates: { monthlyRate: 3, gracePeriodDays: 3 }
          }).arrearsAmount;
          const totalPaid = calculateTotalPaid();
          return Math.max(0, arrears - totalPaid);
        })()}
        contractNo={facilityData ? facilityData.group1.contractNo : ''}
        borrowerName={personalInfo ? personalInfo.name : ''}
      />
    </div>
  );
}
