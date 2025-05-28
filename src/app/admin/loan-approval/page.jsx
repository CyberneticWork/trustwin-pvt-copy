// app/admin/loan-approval/page.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  AlertCircle
} from "lucide-react";

import LoanDetailsCard from "@/components/loan-approval/loan-details-card";

export default function LoanApprovalPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const recordsPerPage = 12;

  // New state for filters
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // State for data from API
  const [loanRequests, setLoanRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0
  });

  // Fetch loan data on component mount
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/loan-approval');

        if (!response.ok) {
          throw new Error('Failed to fetch loan data');
        }

        const data = await response.json();

        if (data.success) {
          setLoanRequests(data.data || []);

          // Calculate statistics from the data if statistics endpoint is not available
          const activeLoans = data.data.filter(loan => loan.status.toLowerCase() === "active").length;
          const pendingLoans = data.data.filter(loan => loan.status.toLowerCase() === "pending" || loan.status.toLowerCase() === "under the review").length;
          const rejectedLoans = data.data.filter(loan => loan.status.toLowerCase() === "rejected").length;

          setStats({
            total: data.data.length,
            active: activeLoans,
            pending: pendingLoans,
            rejected: rejectedLoans
          });
        } else {
          throw new Error(data.error || 'Failed to fetch loan data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching loan data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // Functions for loan actions
  const handleApprove = async (loanId) => {
    try {
      const response = await fetch('/api/loan-approval/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loanId, action: 'approve' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve loan');
      }

      // Update the local state with the new "Waiting for Funds" status
      setLoanRequests(
        loanRequests.map(loan =>
          loan.id === loanId ? { ...loan, status: "Waiting for Funds" } : loan
        )
      );

      // Update stats (still counts as active for statistical purposes)
      setStats(prevStats => ({
        ...prevStats,
        active: prevStats.active + 1,
        pending: prevStats.pending - 1
      }));

      // Close the dialog if it was open
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error approving loan:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleReject = async (loanId) => {
    try {
      const response = await fetch('/api/loan-approval/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loanId, action: 'reject' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject loan');
      }

      // Update the local state
      setLoanRequests(
        loanRequests.map(loan =>
          loan.id === loanId ? { ...loan, status: "Rejected" } : loan
        )
      );

      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        rejected: prevStats.rejected + 1,
        pending: prevStats.pending - 1
      }));

      // Close the dialog if it was open
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleViewDetails = async (loan) => {
    try {
      setSelectedLoan({ ...loan, loading: true });
      setIsDialogOpen(true);

      const response = await fetch(`/api/loan-approval/details?id=${loan.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch loan details');
      }

      const detailData = await response.json();

      if (detailData.success) {
        setSelectedLoan({
          ...loan,
          loading: false,
          details: detailData.data
        });
      } else {
        throw new Error(detailData.error || 'Failed to fetch loan details');
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
      setSelectedLoan({
        ...loan,
        loading: false,
        error: error.message
      });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
  };

  // Filter loans based on all criteria
  const filteredLoans = loanRequests.filter(loan => {
    // Text search filter
    const matchesSearch = searchQuery === "" ? true : (
      loan.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.contractId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.croName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.revenueAmount?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loanType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Status filter
    const matchesStatus = statusFilter === "" ? true : 
      loan.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Date filter
    let matchesDate = true;
    if (startDateFilter) {
      const loanDate = new Date(loan.applicationDate);
      const filterStartDate = new Date(startDateFilter);
      matchesDate = matchesDate && loanDate >= filterStartDate;
    }
    if (endDateFilter) {
      const loanDate = new Date(loan.applicationDate);
      const filterEndDate = new Date(endDateFilter);
      filterEndDate.setHours(23, 59, 59); // Include end of day
      matchesDate = matchesDate && loanDate <= filterEndDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredLoans.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredLoans.slice(indexOfFirstRecord, indexOfLastRecord);

  // Function to handle page navigation
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl">Loading loan data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-red-600">Error: {error}</p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Loan Approval Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                <p className="text-xl font-bold">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Loans</p>
                <p className="text-xl font-bold">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-xl font-bold">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected Loans</p>
                <p className="text-xl font-bold">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg">Loan Applications</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search loans..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <select 
                className="w-full h-9 rounded-md border border-input px-3 py-1"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                value={statusFilter}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="waiting for funds">Waiting for Funds</option>
                <option value="rejected">Rejected</option>
                <option value="under the review">Under Review</option>
              </select>
            </div>
            
            {/* Date Filters */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                type="date"
                className="h-9 w-full sm:w-auto"
                onChange={(e) => {
                  setStartDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                value={startDateFilter}
                placeholder="Start Date"
              />
              <Input
                type="date"
                className="h-9 w-full sm:w-auto"
                onChange={(e) => {
                  setEndDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                value={endDateFilter}
                placeholder="End Date"
              />
            </div>
            
            {/* Reset Filters Button */}
            {(searchQuery || statusFilter || startDateFilter || endDateFilter) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="h-9"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table with column width control to avoid horizontal scrolling */}
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/* Removed Loan ID column */}
                  <th className="px-3 py-3 w-[19%]">Customer</th>
                  <th className="px-3 py-3 w-[10%]">Contract</th>
                  <th className="px-3 py-3 w-[12%]">CRO</th>
                  <th className="px-3 py-3 w-[12%]">Revenue</th>
                  <th className="px-3 py-3 w-[15%]">Status</th>
                  <th className="px-3 py-3 w-[15%]">Loan Type</th>
                  <th className="px-3 py-3 w-[10%]">Date</th>
                  <th className="px-3 py-3 w-[6%]"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.length > 0 ? (
                  currentRecords.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      {/* Removed Loan ID cell */}
                      <td className="px-3 py-3 text-sm text-gray-700 truncate">{loan.customerName}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 truncate">{loan.contractId}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 truncate">{loan.croName}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 truncate">{loan.revenueAmount}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge className={`${loan.status === "Active" ? "bg-green-100 text-green-800" :
                            loan.status === "Waiting for Funds" ? "bg-blue-100 text-blue-800" :
                              loan.status === "Rejected" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                          }`}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 truncate">{loan.loanType}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 truncate">{loan.applicationDate}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(loan)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No loan applications found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700 mx-2 self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastRecord, filteredLoans.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredLoans.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 ${pageNumber === currentPage
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            } text-sm font-medium`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Loan Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLoan ? `Loan Application Details` : 'Loan Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <LoanDetailsCard
              loan={selectedLoan}
              onClose={() => setIsDialogOpen(false)}
              onApprove={handleApprove}
              onReject={handleReject}
              disableContractId={selectedLoan.status?.toLowerCase() === "pending"} // Requirement 2
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
