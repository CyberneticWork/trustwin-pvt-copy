"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import LoanListTable from "../../../components/loanList/LoanListTable";

export default function LoanListPage() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const loansPerPage = 10;

  // Fetch loan data
  useEffect(() => {
    async function fetchLoans() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/loan/loanList?type=${loanTypeFilter}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch loan data");
        }

        const data = await response.json();

        if (data.success) {
          setLoans(data.data);
          setFilteredLoans(data.data);
        } else {
          throw new Error(data.error || "Failed to retrieve loans");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching loans:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLoans();
  }, [loanTypeFilter]);

  // Filter loans based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLoans(loans);
    } else {
      const query = searchQuery.toLowerCase();
      const results = loans.filter(
        (loan) =>
          loan.customerName.toLowerCase().includes(query) ||
          loan.contractId.toLowerCase().includes(query) ||
          loan.croName.toLowerCase().includes(query)
      );
      setFilteredLoans(results);
    }

    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, loans]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading loan data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-600 mb-2">
            Failed to load loans
          </p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Active Loans</h1>
          <p className="text-gray-500">View all active loans in the system</p>
        </div>
      </div>
      <LoanListTable
        loans={loans}
        filteredLoans={filteredLoans}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loanTypeFilter={loanTypeFilter}
        setLoanTypeFilter={setLoanTypeFilter}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        loansPerPage={loansPerPage}
      />
    </div>
  );
}
