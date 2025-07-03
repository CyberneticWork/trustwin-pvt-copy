import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search, Car, Package, Building, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LoanListTable({
  loans,
  filteredLoans,
  searchQuery,
  setSearchQuery,
  loanTypeFilter,
  setLoanTypeFilter,
  currentPage,
  setCurrentPage,
  loansPerPage,
}) {
  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalPages = Math.ceil(filteredLoans.length / loansPerPage);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const getLoanTypeIcon = (loanType) => {
    if (loanType.includes("Auto"))
      return <Car className="h-4 w-4 text-blue-500" />;
    if (loanType.includes("Equipment"))
      return <Package className="h-4 w-4 text-purple-500" />;
    if (loanType.includes("Business"))
      return <Building className="h-4 w-4 text-green-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "waiting for funds":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under the review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Card className="p-2 sm:p-4">
      <CardHeader className="pb-2 px-2 sm:px-4">
        <CardTitle className="text-xl">Loan List</CardTitle>
        <CardDescription>
          Showing {filteredLoans.length} active loans
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4 sm:mb-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by customer, contract ID..."
              className="pl-9 pr-4 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64 flex-shrink-0">
            <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loan Types</SelectItem>
                <SelectItem value="auto">Auto Loans</SelectItem>
                <SelectItem value="business">Business Loans</SelectItem>
                <SelectItem value="equipment">Equipment Loans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {currentLoans.length > 0 ? (
            currentLoans.map((loan) => (
              <div key={loan.id} className="border rounded-lg p-3 shadow-sm bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{loan.id}</div>
                    <div className="text-xs text-gray-500">{loan.contractId}</div>
                  </div>
                  <Badge className={`font-medium text-xs ${getStatusBadgeColor(loan.status)}`}>
                    {loan.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="truncate">{loan.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ID</p>
                    <p>{loan.customerId || loan.customer_id || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <div className="flex items-center gap-1">
                      {getLoanTypeIcon(loan.loanType)}
                      <span className="truncate">{loan.loanType}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p>{loan.revenueAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CRO</p>
                    <p>{loan.croName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p>{loan.applicationDate}</p>
                  </div>
                </div>
                
                <Link href={`/loan-info/installments/${loan.contractId}`}>
                  <button className="w-full flex items-center justify-center text-sm py-2 px-3 rounded text-white font-medium bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all shadow-sm">
                    View Payments <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <FileText className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-lg font-medium">No loans found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">ID/Contract</TableHead>
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Customer ID</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Amount</TableHead>
                <TableHead className="font-medium">CRO</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLoans.length > 0 ? (
                currentLoans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-gray-50">
                    <TableCell className="whitespace-nowrap min-w-[100px]">
                      <div className="font-medium">{loan.id}</div>
                      <div className="text-xs text-gray-500">
                        {loan.contractId}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">
                      {loan.customerName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[100px]">
                      {loan.customerId || loan.customer_id || "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        {getLoanTypeIcon(loan.loanType)}
                        <span>{loan.loanType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[100px]">
                      {loan.revenueAmount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[80px]">
                      {loan.croName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">
                      <Badge className={`font-medium ${getStatusBadgeColor(loan.status)}`}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[100px]">
                      {loan.applicationDate}
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[100px]">
                      <Link href={`/loan-info/installments/${loan.contractId}`}>
                        <button className="text-sm px-3 py-1 rounded text-white font-medium bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all shadow-md">
                          Payments
                        </button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No loans found</p>
                      <p className="text-sm">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredLoans.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Showing {indexOfFirstLoan + 1} to{" "}
              {Math.min(indexOfLastLoan, filteredLoans.length)} of{" "}
              {filteredLoans.length} loans
            </p>

            <Pagination
              page={currentPage}
              maxPage={totalPages}
              onPageChange={handlePageChange}
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
